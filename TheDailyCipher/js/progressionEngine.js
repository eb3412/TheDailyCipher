/*
=========================================================
THE DAILY CIPHER
PROGRESSION ENGINE v1.0
=========================================================

Responsibilities:

- Calculate XP from completed activities
- Calculate total XP
- Determine player level
- Determine progress toward next level
- Provide progression summaries

activityHistory remains the source of truth.
=========================================================
*/


const ProgressionEngine = (() => {


    /*
    =====================================================
    LEVEL CONFIG
    =====================================================

    Level requirements intentionally increase gradually.

    XP required to ENTER each level:

    Level 1  = 0
    Level 2  = 100
    Level 3  = 250
    Level 4  = 450
    Level 5  = 700
    ...

    Formula after Level 1:

    XP threshold =
        50 * level * (level - 1)

    Examples:

    L2 = 100
    L3 = 300
    L4 = 600
    L5 = 1000

    We use a slightly smoother custom formula below.
    =====================================================
    */


    function getXPForLevel(
        level
    ) {

        const safeLevel =
            Math.max(
                1,
                Math.floor(
                    Number(level)
                    ||
                    1
                )
            );


        if (
            safeLevel ===
            1
        ) {

            return 0;
        }


        /*
        Quadratic progression.

        L2  = 100
        L3  = 250
        L4  = 450
        L5  = 700
        L6  = 1000
        L10 = 2700
        */

        const n =
            safeLevel - 1;


        return Math.round(
            25
            *
            n
            *
            (
                n + 3
            )
        );
    }


    /*
    =====================================================
    DIFFICULTY XP
    =====================================================
    */

    const DIFFICULTY_XP = {

        Easy:
            25,

        Medium:
            45,

        Hard:
            70

    };


    /*
    =====================================================
    MODE BONUSES
    =====================================================
    */

    const MODE_XP_BONUS = {

        guided:
            0,

        competition:
            10,

        speed:
            15

    };


    /*
    =====================================================
    CALCULATE XP FOR ONE ACTIVITY
    =====================================================
    */

    function calculateActivityXP(
        activity = {}
    ) {

        /*
        Unsolved attempts give a tiny participation
        amount so effort is recorded without making
        failure farming worthwhile.
        */

        if (
            activity.solved
            !==
            true
        ) {

            return 3;
        }


        const difficulty =
            activity.difficulty
            ||
            "Easy";


        let xp =
            DIFFICULTY_XP[
                difficulty
            ]
            ??
            25;


        /*
        ---------------------------------------------
        LOW-GUESS BONUS
        ---------------------------------------------
        */

        const guesses =
            Number(
                activity.guesses
            )
            ||
            0;


        if (
            guesses ===
            1
        ) {

            xp +=
                12;

        } else if (
            guesses ===
            2
        ) {

            xp +=
                6;
        }


        /*
        ---------------------------------------------
        HINT PENALTY
        ---------------------------------------------

        Hints reduce XP but can never make a solved
        puzzle worth less than 10 XP.
        */

        const hints =
            Math.max(
                0,
                Number(
                    activity.hints
                )
                ||
                0
            );


        xp -=
            hints
            *
            4;


        /*
        ---------------------------------------------
        PRACTICE MODE BONUS
        ---------------------------------------------
        */

        if (
            activity.source ===
            "practice"
            &&
            activity.mode
        ) {

            xp +=
                MODE_XP_BONUS[
                    activity.mode
                ]
                ??
                0;
        }


        /*
        ---------------------------------------------
        SPEED BONUS
        ---------------------------------------------

        Only modest bonuses.

        We do NOT want users farming XP by selecting
        only trivial ciphers and racing them.
        */

        const time =
            Number(
                activity.timeSeconds
            )
            ||
            0;


        if (
            time > 0
        ) {

            if (
                difficulty ===
                "Hard"
                &&
                time <=
                90
            ) {

                xp +=
                    10;

            } else if (
                difficulty ===
                "Medium"
                &&
                time <=
                60
            ) {

                xp +=
                    7;

            } else if (
                difficulty ===
                "Easy"
                &&
                time <=
                30
            ) {

                xp +=
                    5;
            }
        }


        /*
        ---------------------------------------------
        DAILY BONUS
        ---------------------------------------------

        This begins working automatically once Daily
        activities are connected to activityHistory.
        */

        if (
            activity.source ===
            "daily"
        ) {

            xp +=
                10;
        }


        return Math.max(
            10,
            Math.round(
                xp
            )
        );
    }


    /*
    =====================================================
    TOTAL XP
    =====================================================
    */

    function getTotalXP(
        history = null
    ) {

        const activities =
            Array.isArray(
                history
            )
                ?
                history
                :
                (
                    typeof getActivityHistory
                    ===
                    "function"
                        ?
                        getActivityHistory()
                        :
                        []
                );


        return activities.reduce(
            (
                total,
                activity
            ) => {

                return (
                    total
                    +
                    calculateActivityXP(
                        activity
                    )
                );

            },
            0
        );
    }


    /*
    =====================================================
    LEVEL FROM XP
    =====================================================
    */

    function getLevelFromXP(
        xp
    ) {

        const totalXP =
            Math.max(
                0,
                Number(
                    xp
                )
                ||
                0
            );


        let level =
            1;


        /*
        500 is only a safety cap.
        */

        while (
            level <
            500
            &&
            totalXP
            >=
            getXPForLevel(
                level + 1
            )
        ) {

            level++;
        }


        return level;
    }


    /*
    =====================================================
    LEVEL TITLE
    =====================================================
    */

    function getLevelTitle(
        level
    ) {

        if (
            level >=
            50
        ) {

            return "Master Cryptanalyst";
        }


        if (
            level >=
            40
        ) {

            return "Elite Codebreaker";
        }


        if (
            level >=
            30
        ) {

            return "Cryptanalyst";
        }


        if (
            level >=
            20
        ) {

            return "Cipher Expert";
        }


        if (
            level >=
            15
        ) {

            return "Codebreaker";
        }


        if (
            level >=
            10
        ) {

            return "Cipher Solver";
        }


        if (
            level >=
            5
        ) {

            return "Cipher Apprentice";
        }


        return "Cipher Rookie";
    }


    /*
    =====================================================
    PROGRESS SUMMARY
    =====================================================
    */

    function getProgressSummary(
        history = null
    ) {

        const totalXP =
            getTotalXP(
                history
            );


        const level =
            getLevelFromXP(
                totalXP
            );


        const currentThreshold =
            getXPForLevel(
                level
            );


        const nextThreshold =
            getXPForLevel(
                level + 1
            );


        const xpIntoLevel =
            totalXP
            -
            currentThreshold;


        const xpNeededForLevel =
            nextThreshold
            -
            currentThreshold;


        const xpRemaining =
            Math.max(
                0,
                nextThreshold
                -
                totalXP
            );


        const progressPercent =
            xpNeededForLevel
            <=
            0
                ?
                100
                :
                Math.min(
                    100,
                    Math.max(
                        0,
                        Math.round(
                            xpIntoLevel
                            /
                            xpNeededForLevel
                            *
                            100
                        )
                    )
                );


        return {

            totalXP,

            level,

            title:
                getLevelTitle(
                    level
                ),

            currentLevelXP:
                currentThreshold,

            nextLevelXP:
                nextThreshold,

            xpIntoLevel,

            xpNeededForLevel,

            xpRemaining,

            progressPercent

        };
    }


    /*
    =====================================================
    XP BREAKDOWN
    =====================================================
    */

    function getXPBreakdown(
        history = null
    ) {

        const activities =
            Array.isArray(
                history
            )
                ?
                history
                :
                (
                    typeof getActivityHistory
                    ===
                    "function"
                        ?
                        getActivityHistory()
                        :
                        []
                );


        const breakdown = {

            total:
                0,

            daily:
                0,

            practice:
                0,

            solved:
                0,

            unsolved:
                0,

            byCipher:
                {}

        };


        activities.forEach(
            activity => {

                const xp =
                    calculateActivityXP(
                        activity
                    );


                breakdown.total +=
                    xp;


                if (
                    activity.source ===
                    "daily"
                ) {

                    breakdown.daily +=
                        xp;
                }


                if (
                    activity.source ===
                    "practice"
                ) {

                    breakdown.practice +=
                        xp;
                }


                if (
                    activity.solved
                ) {

                    breakdown.solved +=
                        xp;

                } else {

                    breakdown.unsolved +=
                        xp;
                }


                const cipher =
                    activity.cipher
                    ||
                    "unknown";


                breakdown.byCipher[
                    cipher
                ] =
                    (
                        breakdown.byCipher[
                            cipher
                        ]
                        ||
                        0
                    )
                    +
                    xp;

            }
        );


        return breakdown;
    }


    /*
    =====================================================
    PUBLIC API
    =====================================================
    */

    return {

        calculateActivityXP,

        getXPForLevel,

        getTotalXP,

        getLevelFromXP,

        getLevelTitle,

        getProgressSummary,

        getXPBreakdown

    };


})();