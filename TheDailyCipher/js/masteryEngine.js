/*
=========================================================
THE DAILY CIPHER
MASTERY ENGINE v1.0
=========================================================

Calculates skill / mastery independently for each cipher.

Source of truth:
activityHistory from storage.js

Mastery considers:
- Attempts
- Solves
- Solve rate
- Difficulty
- Hints
- Guess efficiency
- Solve time
- Recent consistency

Mastery score:
0 - 100
=========================================================
*/


const MasteryEngine = (() => {


    /*
    =====================================================
    SUPPORTED CIPHERS
    =====================================================
    */

    const CIPHERS = [

        "caesar",

        "atbash",

        "affine",

        "railfence",

        "baconian",

        "aristocrat",

        "patristocrat",

        "porta",

        "columnar",

        "nihilist",

        "hill",

        "fractionatedmorse"

    ];


    /*
    =====================================================
    DISPLAY NAMES
    =====================================================
    */

    const DISPLAY_NAMES = {

        caesar:
            "Caesar Cipher",

        atbash:
            "Atbash Cipher",

        affine:
            "Affine Cipher",

        railfence:
            "Rail Fence Cipher",

        baconian:
            "Baconian Cipher",

        aristocrat:
            "Aristocrat Cipher",

        patristocrat:
            "Patristocrat Cipher",

        porta:
            "Porta Cipher",

        columnar:
            "Complete Columnar Transposition",

        nihilist:
            "Nihilist Cipher",

        hill:
            "Hill Cipher",

        fractionatedmorse:
            "Fractionated Morse Cipher"

    };


    /*
    =====================================================
    DIFFICULTY WEIGHTS
    =====================================================
    */

    const DIFFICULTY_WEIGHT = {

        Easy:
            1,

        Medium:
            1.35,

        Hard:
            1.75

    };


    /*
    =====================================================
    TARGET SOLVE TIMES

    Used only for a modest speed component.

    Seconds.
    =====================================================
    */

    const TARGET_TIMES = {

        Easy:
            45,

        Medium:
            90,

        Hard:
            180

    };


    /*
    =====================================================
    GET HISTORY
    =====================================================
    */

    function getHistory() {

        if (
            typeof getActivityHistory
            !==
            "function"
        ) {

            console.warn(
                "MasteryEngine could not access activity history."
            );


            return [];
        }


        return getActivityHistory();
    }


    /*
    =====================================================
    HISTORY FOR ONE CIPHER
    =====================================================
    */

    function getCipherHistory(
        cipher
    ) {

        const normalized =
            normalizeCipher(
                cipher
            );


        return getHistory()
            .filter(
                activity =>
                    activity.cipher
                    ===
                    normalized
            );
    }


    /*
    =====================================================
    EMPTY MASTERY
    =====================================================
    */

    function createEmptyMastery(
        cipher
    ) {

        const normalized =
            normalizeCipher(
                cipher
            );


        return {

            cipher:
                normalized,

            name:
                getCipherName(
                    normalized
                ),

            mastery:
                0,

            rank:
                "Unranked",

            attempts:
                0,

            solved:
                0,

            failed:
                0,

            solveRate:
                0,

            averageTime:
                0,

            averageHints:
                0,

            averageGuesses:
                0,

            easySolves:
                0,

            mediumSolves:
                0,

            hardSolves:
                0,

            recentSolveRate:
                0,

            experienceScore:
                0,

            performanceScore:
                0,

            difficultyScore:
                0,

            efficiencyScore:
                0,

            consistencyScore:
                0

        };
    }


    /*
    =====================================================
    MAIN MASTERY CALCULATION
    =====================================================
    */

    function getCipherMastery(
        cipher
    ) {

        const normalized =
            normalizeCipher(
                cipher
            );


        const history =
            getCipherHistory(
                normalized
            );


        if (
            history.length ===
            0
        ) {

            return createEmptyMastery(
                normalized
            );
        }


        const attempts =
            history.length;


        const solvedHistory =
            history.filter(
                activity =>
                    activity.solved
                    ===
                    true
            );


        const solved =
            solvedHistory.length;


        const failed =
            attempts
            -
            solved;


        const solveRate =
            attempts ===
            0
                ?
                0
                :
                solved
                /
                attempts;


        /*
        =================================================
        DIFFICULTY COUNTS
        =================================================
        */

        const easySolves =
            solvedHistory.filter(
                activity =>
                    activity.difficulty
                    ===
                    "Easy"
            ).length;


        const mediumSolves =
            solvedHistory.filter(
                activity =>
                    activity.difficulty
                    ===
                    "Medium"
            ).length;


        const hardSolves =
            solvedHistory.filter(
                activity =>
                    activity.difficulty
                    ===
                    "Hard"
            ).length;


        /*
        =================================================
        AVERAGES
        =================================================
        */

        const averageTime =
            average(
                solvedHistory.map(
                    activity =>
                        Number(
                            activity.timeSeconds
                        )
                        ||
                        0
                )
                .filter(
                    value =>
                        value >
                        0
                )
            );


        const averageHints =
            average(
                solvedHistory.map(
                    activity =>
                        Number(
                            activity.hints
                        )
                        ||
                        0
                )
            );


        const averageGuesses =
            average(
                solvedHistory.map(
                    activity =>
                        Number(
                            activity.guesses
                        )
                        ||
                        0
                )
                .filter(
                    value =>
                        value >
                        0
                )
            );


        /*
        =================================================
        COMPONENT 1
        EXPERIENCE
        0 - 20 points
        =================================================

        Repeated experience matters, but we don't want
        brute-force repetition alone to create mastery.

        About 20 weighted solves reaches the cap.
        =================================================
        */

        const weightedSolves =
            solvedHistory.reduce(
                (
                    total,
                    activity
                ) => {

                    return (
                        total
                        +
                        (
                            DIFFICULTY_WEIGHT[
                                activity.difficulty
                            ]
                            ||
                            1
                        )
                    );

                },
                0
            );


        const experienceScore =
            clamp(
                weightedSolves,
                0,
                20
            );


        /*
        =================================================
        COMPONENT 2
        PERFORMANCE / SOLVE RATE
        0 - 30 points
        =================================================
        */

        const performanceScore =
            solveRate
            *
            30;


        /*
        =================================================
        COMPONENT 3
        DIFFICULTY
        0 - 25 points
        =================================================

        Hard solves carry the most weight.
        =================================================
        */

        const difficultyRaw =
            (
                easySolves
                *
                0.6
            )

            +

            (
                mediumSolves
                *
                1.5
            )

            +

            (
                hardSolves
                *
                3
            );


        const difficultyScore =
            clamp(
                difficultyRaw,
                0,
                25
            );


        /*
        =================================================
        COMPONENT 4
        EFFICIENCY
        0 - 15 points
        =================================================

        Combines:
        - hints
        - guesses
        - speed

        This component is intentionally moderate.
        =================================================
        */

        const efficiencyScore =
            calculateEfficiencyScore(
                solvedHistory
            );


        /*
        =================================================
        COMPONENT 5
        RECENT CONSISTENCY
        0 - 10 points
        =================================================

        Uses most recent 10 attempts.
        =================================================
        */

        const recent =
            history.slice(
                0,
                10
            );


        const recentSolved =
            recent.filter(
                activity =>
                    activity.solved
            ).length;


        const recentSolveRate =
            recent.length ===
            0
                ?
                0
                :
                recentSolved
                /
                recent.length;


        const consistencyScore =
            recentSolveRate
            *
            10;


        /*
        =================================================
        TOTAL
        =================================================
        */

        let mastery =
            experienceScore

            +

            performanceScore

            +

            difficultyScore

            +

            efficiencyScore

            +

            consistencyScore;


        mastery =
            Math.round(
                clamp(
                    mastery,
                    0,
                    100
                )
            );


        /*
        Prevent extremely high mastery from only a
        handful of lucky solves.
        */

        if (
            attempts <
            3
        ) {

            mastery =
                Math.min(
                    mastery,
                    35
                );

        } else if (
            attempts <
            5
        ) {

            mastery =
                Math.min(
                    mastery,
                    55
                );

        } else if (
            attempts <
            10
        ) {

            mastery =
                Math.min(
                    mastery,
                    80
                );
        }


        return {

            cipher:
                normalized,

            name:
                getCipherName(
                    normalized
                ),

            mastery,

            rank:
                getMasteryRank(
                    mastery
                ),

            attempts,

            solved,

            failed,

            solveRate:
                Math.round(
                    solveRate
                    *
                    100
                ),

            averageTime:
                Math.round(
                    averageTime
                ),

            averageHints:
                roundTo(
                    averageHints,
                    1
                ),

            averageGuesses:
                roundTo(
                    averageGuesses,
                    1
                ),

            easySolves,

            mediumSolves,

            hardSolves,

            recentSolveRate:
                Math.round(
                    recentSolveRate
                    *
                    100
                ),

            experienceScore:
                Math.round(
                    experienceScore
                ),

            performanceScore:
                Math.round(
                    performanceScore
                ),

            difficultyScore:
                Math.round(
                    difficultyScore
                ),

            efficiencyScore:
                Math.round(
                    efficiencyScore
                ),

            consistencyScore:
                Math.round(
                    consistencyScore
                )

        };
    }


    /*
    =====================================================
    EFFICIENCY SCORE
    =====================================================
    */

    function calculateEfficiencyScore(
        solvedHistory
    ) {

        if (
            solvedHistory.length ===
            0
        ) {

            return 0;
        }


        let total =
            0;


        solvedHistory.forEach(
            activity => {

                let score =
                    15;


                /*
                -----------------------------------------
                HINTS
                -----------------------------------------
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


                score -=
                    hints
                    *
                    2;


                /*
                -----------------------------------------
                GUESSES
                -----------------------------------------
                */

                const guesses =
                    Math.max(
                        1,
                        Number(
                            activity.guesses
                        )
                        ||
                        1
                    );


                if (
                    guesses >
                    1
                ) {

                    score -=
                        (
                            guesses - 1
                        )
                        *
                        1.25;
                }


                /*
                -----------------------------------------
                TIME
                -----------------------------------------
                */

                const time =
                    Number(
                        activity.timeSeconds
                    )
                    ||
                    0;


                const target =
                    TARGET_TIMES[
                        activity.difficulty
                    ]
                    ||
                    90;


                if (
                    time >
                    0
                ) {

                    const ratio =
                        time
                        /
                        target;


                    if (
                        ratio <=
                        0.75
                    ) {

                        score +=
                            1;

                    } else if (
                        ratio >
                        2
                    ) {

                        score -=
                            2;

                    } else if (
                        ratio >
                        1.5
                    ) {

                        score -=
                            1;
                    }
                }


                total +=
                    clamp(
                        score,
                        0,
                        15
                    );

            }
        );


        /*
        Average efficiency across solves.
        */

        return total
            /
            solvedHistory.length;
    }


    /*
    =====================================================
    ALL CIPHERS
    =====================================================
    */

    function getAllMastery() {

        return CIPHERS
            .map(
                cipher =>
                    getCipherMastery(
                        cipher
                    )
            );
    }


    /*
    =====================================================
    SORTED MASTERY
    =====================================================
    */

    function getMasteryRanking() {

        return getAllMastery()
            .sort(
                (
                    a,
                    b
                ) => {

                    if (
                        b.mastery !==
                        a.mastery
                    ) {

                        return (
                            b.mastery
                            -
                            a.mastery
                        );
                    }


                    if (
                        b.attempts !==
                        a.attempts
                    ) {

                        return (
                            b.attempts
                            -
                            a.attempts
                        );
                    }


                    return a.name
                        .localeCompare(
                            b.name
                        );

                }
            );
    }


    /*
    =====================================================
    STRONGEST CIPHER
    =====================================================
    */

    function getStrongestCipher() {

        const ranking =
            getMasteryRanking()
                .filter(
                    item =>
                        item.attempts >
                        0
                );


        if (
            ranking.length ===
            0
        ) {

            return null;
        }


        return ranking[0];
    }


    /*
    =====================================================
    WEAKEST PRACTICED CIPHER
    =====================================================
    */

    function getWeakestCipher() {

        const practiced =
            getAllMastery()
                .filter(
                    item =>
                        item.attempts >
                        0
                );


        if (
            practiced.length ===
            0
        ) {

            return null;
        }


        practiced.sort(
            (
                a,
                b
            ) => {

                if (
                    a.mastery !==
                    b.mastery
                ) {

                    return (
                        a.mastery
                        -
                        b.mastery
                    );
                }


                return (
                    b.attempts
                    -
                    a.attempts
                );

            }
        );


        return practiced[0];
    }


    /*
    =====================================================
    RECOMMENDED CIPHER
    =====================================================
    */

    function getRecommendedCipher() {

        const all =
            getAllMastery();


        /*
        First priority:
        Ciphers never practiced.
        */

        const unpracticed =
            all.filter(
                item =>
                    item.attempts ===
                    0
            );


        if (
            unpracticed.length >
            0
        ) {

            return {

                ...unpracticed[0],

                recommendationReason:
                    "You have not practiced this cipher yet."

            };
        }


        /*
        Otherwise recommend lowest mastery.
        */

        const weakest =
            getWeakestCipher();


        if (
            !weakest
        ) {

            return null;
        }


        let reason =
            "This is currently your lowest-mastery cipher.";


        if (
            weakest.solveRate <
            60
        ) {

            reason =
                "Your solve rate is low on this cipher.";

        } else if (
            weakest.hardSolves ===
            0
            &&
            weakest.mastery >=
            50
        ) {

            reason =
                "You are doing well here, but have not completed a Hard solve yet.";

        } else if (
            weakest.recentSolveRate <
            70
        ) {

            reason =
                "Your recent consistency on this cipher could improve.";
        }


        return {

            ...weakest,

            recommendationReason:
                reason

        };
    }


    /*
    =====================================================
    OVERALL MASTERY
    =====================================================

    Only practiced ciphers count.

    This prevents twelve unplayed ciphers from making
    a new user's overall mastery meaningless.
    =====================================================
    */

    function getOverallMastery() {

        const practiced =
            getAllMastery()
                .filter(
                    item =>
                        item.attempts >
                        0
                );


        if (
            practiced.length ===
            0
        ) {

            return {

                mastery:
                    0,

                rank:
                    "Unranked",

                ciphersPracticed:
                    0,

                totalCiphers:
                    CIPHERS.length

            };
        }


        const score =
            average(
                practiced.map(
                    item =>
                        item.mastery
                )
            );


        const mastery =
            Math.round(
                score
            );


        return {

            mastery,

            rank:
                getMasteryRank(
                    mastery
                ),

            ciphersPracticed:
                practiced.length,

            totalCiphers:
                CIPHERS.length

        };
    }


    /*
    =====================================================
    MASTERY RANK
    =====================================================
    */

    function getMasteryRank(
        mastery
    ) {

        const score =
            Number(
                mastery
            )
            ||
            0;


        if (
            score >=
            95
        ) {

            return "Master";
        }


        if (
            score >=
            85
        ) {

            return "Expert";
        }


        if (
            score >=
            70
        ) {

            return "Advanced";
        }


        if (
            score >=
            50
        ) {

            return "Intermediate";
        }


        if (
            score >=
            25
        ) {

            return "Developing";
        }


        if (
            score >
            0
        ) {

            return "Beginner";
        }


        return "Unranked";
    }


    /*
    =====================================================
    CIPHER NAME
    =====================================================
    */

    function getCipherName(
        cipher
    ) {

        const normalized =
            normalizeCipher(
                cipher
            );


        return (
            DISPLAY_NAMES[
                normalized
            ]
            ||
            normalized
        );
    }


    /*
    =====================================================
    HELPERS
    =====================================================
    */

    function normalizeCipher(
        cipher
    ) {

        return String(
            cipher
            ||
            ""
        )
        .toLowerCase()
        .trim();
    }


    function average(
        values
    ) {

        const valid =
            values.filter(
                value =>
                    Number.isFinite(
                        Number(
                            value
                        )
                    )
            );


        if (
            valid.length ===
            0
        ) {

            return 0;
        }


        return valid.reduce(
            (
                sum,
                value
            ) =>
                sum
                +
                Number(
                    value
                ),
            0
        )
        /
        valid.length;
    }


    function clamp(
        value,
        minimum,
        maximum
    ) {

        return Math.min(
            maximum,
            Math.max(
                minimum,
                Number(
                    value
                )
                ||
                0
            )
        );
    }


    function roundTo(
        value,
        places
    ) {

        const multiplier =
            10
            **
            places;


        return Math.round(
            (
                Number(
                    value
                )
                ||
                0
            )
            *
            multiplier
        )
        /
        multiplier;
    }


    /*
    =====================================================
    PUBLIC API
    =====================================================
    */

    return {

        getCipherMastery,

        getAllMastery,

        getMasteryRanking,

        getStrongestCipher,

        getWeakestCipher,

        getRecommendedCipher,

        getOverallMastery,

        getMasteryRank,

        getCipherName

    };


})();