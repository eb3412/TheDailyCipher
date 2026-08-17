/*
=========================================================
THE DAILY CIPHER
ACHIEVEMENT ENGINE v1.0
=========================================================

Responsibilities:

- Define achievements
- Evaluate achievement requirements
- Detect unlocked achievements
- Track when achievements were first unlocked
- Provide achievement progress
- Provide achievement summaries

Sources:
- activityHistory
- ProgressionEngine
- MasteryEngine
- StreakEngine

=========================================================
*/


window.AchievementEngine = (() => {


    const STORAGE_KEY =
        "tdc_achievement_state_v1";


    /*
    =====================================================
    ACHIEVEMENT DEFINITIONS
    =====================================================

    Every achievement contains:

    id
    name
    description
    category
    tier
    hidden
    target
    metric()

    metric() returns the user's current progress toward
    that achievement.
    =====================================================
    */

    const ACHIEVEMENTS = [


        /*
        =================================================
        SOLVING
        =================================================
        */

        {
            id:
                "first_crack",

            name:
                "First Crack",

            description:
                "Solve your first puzzle.",

            category:
                "solving",

            tier:
                "bronze",

            hidden:
                false,

            target:
                1,

            metric:
                context =>
                    context.totalSolved
        },


        {
            id:
                "getting_started",

            name:
                "Getting Started",

            description:
                "Solve 10 puzzles.",

            category:
                "solving",

            tier:
                "bronze",

            hidden:
                false,

            target:
                10,

            metric:
                context =>
                    context.totalSolved
        },


        {
            id:
                "cipher_regular",

            name:
                "Cipher Regular",

            description:
                "Solve 25 puzzles.",

            category:
                "solving",

            tier:
                "silver",

            hidden:
                false,

            target:
                25,

            metric:
                context =>
                    context.totalSolved
        },


        {
            id:
                "half_century",

            name:
                "Half Century",

            description:
                "Solve 50 puzzles.",

            category:
                "solving",

            tier:
                "silver",

            hidden:
                false,

            target:
                50,

            metric:
                context =>
                    context.totalSolved
        },


        {
            id:
                "century_club",

            name:
                "Century Club",

            description:
                "Solve 100 puzzles.",

            category:
                "solving",

            tier:
                "gold",

            hidden:
                false,

            target:
                100,

            metric:
                context =>
                    context.totalSolved
        },


        {
            id:
                "codebreaking_machine",

            name:
                "Codebreaking Machine",

            description:
                "Solve 500 puzzles.",

            category:
                "solving",

            tier:
                "platinum",

            hidden:
                false,

            target:
                500,

            metric:
                context =>
                    context.totalSolved
        },


        /*
        =================================================
        DIFFICULTY
        =================================================
        */

        {
            id:
                "hard_mode",

            name:
                "Hard Mode",

            description:
                "Solve your first Hard puzzle.",

            category:
                "difficulty",

            tier:
                "bronze",

            hidden:
                false,

            target:
                1,

            metric:
                context =>
                    context.hardSolves
        },


        {
            id:
                "hard_worker",

            name:
                "Hard Worker",

            description:
                "Solve 10 Hard puzzles.",

            category:
                "difficulty",

            tier:
                "silver",

            hidden:
                false,

            target:
                10,

            metric:
                context =>
                    context.hardSolves
        },


        {
            id:
                "hardcore",

            name:
                "Hardcore",

            description:
                "Solve 50 Hard puzzles.",

            category:
                "difficulty",

            tier:
                "gold",

            hidden:
                false,

            target:
                50,

            metric:
                context =>
                    context.hardSolves
        },


        /*
        =================================================
        EFFICIENCY
        =================================================
        */

        {
            id:
                "no_help_needed",

            name:
                "No Help Needed",

            description:
                "Solve a puzzle without using any hints.",

            category:
                "efficiency",

            tier:
                "bronze",

            hidden:
                false,

            target:
                1,

            metric:
                context =>
                    context.zeroHintSolves
        },


        {
            id:
                "one_shot",

            name:
                "One Shot",

            description:
                "Solve a puzzle on your first guess.",

            category:
                "efficiency",

            tier:
                "bronze",

            hidden:
                false,

            target:
                1,

            metric:
                context =>
                    context.firstGuessSolves
        },


        {
            id:
                "clean_solver",

            name:
                "Clean Solver",

            description:
                "Solve 10 puzzles on the first guess with no hints.",

            category:
                "efficiency",

            tier:
                "silver",

            hidden:
                false,

            target:
                10,

            metric:
                context =>
                    context.cleanSolves
        },


        {
            id:
                "precision_breaker",

            name:
                "Precision Breaker",

            description:
                "Solve 50 puzzles on the first guess with no hints.",

            category:
                "efficiency",

            tier:
                "gold",

            hidden:
                false,

            target:
                50,

            metric:
                context =>
                    context.cleanSolves
        },


        /*
        =================================================
        SPEED
        =================================================
        */

        {
            id:
                "quick_crack",

            name:
                "Quick Crack",

            description:
                "Solve an Easy puzzle in 30 seconds or less.",

            category:
                "speed",

            tier:
                "bronze",

            hidden:
                false,

            target:
                1,

            metric:
                context =>
                    context.fastEasySolves
        },


        {
            id:
                "speed_breaker",

            name:
                "Speed Breaker",

            description:
                "Solve a Medium puzzle in 60 seconds or less.",

            category:
                "speed",

            tier:
                "silver",

            hidden:
                false,

            target:
                1,

            metric:
                context =>
                    context.fastMediumSolves
        },


        {
            id:
                "hard_and_fast",

            name:
                "Hard and Fast",

            description:
                "Solve a Hard puzzle in 90 seconds or less.",

            category:
                "speed",

            tier:
                "gold",

            hidden:
                false,

            target:
                1,

            metric:
                context =>
                    context.fastHardSolves
        },


        /*
        =================================================
        STREAKS
        =================================================
        */

        {
            id:
                "on_a_roll",

            name:
                "On a Roll",

            description:
                "Reach a 3-day Activity Streak.",

            category:
                "streak",

            tier:
                "bronze",

            hidden:
                false,

            target:
                3,

            metric:
                context =>
                    context.longestActivityStreak
        },


        {
            id:
                "week_of_codes",

            name:
                "Week of Codes",

            description:
                "Reach a 7-day Activity Streak.",

            category:
                "streak",

            tier:
                "silver",

            hidden:
                false,

            target:
                7,

            metric:
                context =>
                    context.longestActivityStreak
        },


        {
            id:
                "perfect_week",

            name:
                "Perfect Week",

            description:
                "Reach a 7-day Daily Cipher streak.",

            category:
                "streak",

            tier:
                "gold",

            hidden:
                false,

            target:
                7,

            metric:
                context =>
                    context.longestDailyStreak
        },


        {
            id:
                "cipher_month",

            name:
                "Cipher Month",

            description:
                "Reach a 30-day Activity Streak.",

            category:
                "streak",

            tier:
                "gold",

            hidden:
                false,

            target:
                30,

            metric:
                context =>
                    context.longestActivityStreak
        },


        {
            id:
                "daily_devotion",

            name:
                "Daily Devotion",

            description:
                "Reach a 30-day Daily Cipher streak.",

            category:
                "streak",

            tier:
                "platinum",

            hidden:
                false,

            target:
                30,

            metric:
                context =>
                    context.longestDailyStreak
        },


        /*
        =================================================
        MASTERY
        =================================================
        */

        {
            id:
                "specialist",

            name:
                "Specialist",

            description:
                "Reach 75 mastery in any cipher.",

            category:
                "mastery",

            tier:
                "silver",

            hidden:
                false,

            target:
                75,

            metric:
                context =>
                    context.highestMastery
        },


        {
            id:
                "expert_codebreaker",

            name:
                "Expert Codebreaker",

            description:
                "Reach 85 mastery in any cipher.",

            category:
                "mastery",

            tier:
                "gold",

            hidden:
                false,

            target:
                85,

            metric:
                context =>
                    context.highestMastery
        },


        {
            id:
                "cipher_master",

            name:
                "Cipher Master",

            description:
                "Reach 95 mastery in any cipher.",

            category:
                "mastery",

            tier:
                "platinum",

            hidden:
                false,

            target:
                95,

            metric:
                context =>
                    context.highestMastery
        },


        {
            id:
                "multi_specialist",

            name:
                "Multi-Specialist",

            description:
                "Reach 75 mastery in 3 different ciphers.",

            category:
                "mastery",

            tier:
                "gold",

            hidden:
                false,

            target:
                3,

            metric:
                context =>
                    context.ciphersAbove75
        },


        /*
        =================================================
        COVERAGE
        =================================================
        */

        {
            id:
                "explorer",

            name:
                "Cipher Explorer",

            description:
                "Practice 5 different cipher types.",

            category:
                "coverage",

            tier:
                "bronze",

            hidden:
                false,

            target:
                5,

            metric:
                context =>
                    context.ciphersPracticed
        },


        {
            id:
                "well_rounded",

            name:
                "Well Rounded",

            description:
                "Practice 10 different cipher types.",

            category:
                "coverage",

            tier:
                "silver",

            hidden:
                false,

            target:
                10,

            metric:
                context =>
                    context.ciphersPracticed
        },


        {
            id:
                "polymath",

            name:
                "Polymath",

            description:
                "Practice every cipher type on The Daily Cipher.",

            category:
                "coverage",

            tier:
                "gold",

            hidden:
                false,

            target:
                12,

            metric:
                context =>
                    context.ciphersPracticed
        },


        /*
        =================================================
        LEVELS
        =================================================
        */

        {
            id:
                "level_5",

            name:
                "Apprentice",

            description:
                "Reach Level 5.",

            category:
                "level",

            tier:
                "bronze",

            hidden:
                false,

            target:
                5,

            metric:
                context =>
                    context.level
        },


        {
            id:
                "level_10",

            name:
                "Double Digits",

            description:
                "Reach Level 10.",

            category:
                "level",

            tier:
                "silver",

            hidden:
                false,

            target:
                10,

            metric:
                context =>
                    context.level
        },


        {
            id:
                "level_20",

            name:
                "Cipher Expert",

            description:
                "Reach Level 20.",

            category:
                "level",

            tier:
                "gold",

            hidden:
                false,

            target:
                20,

            metric:
                context =>
                    context.level
        },


        {
            id:
                "level_50",

            name:
                "Master Cryptanalyst",

            description:
                "Reach Level 50.",

            category:
                "level",

            tier:
                "platinum",

            hidden:
                false,

            target:
                50,

            metric:
                context =>
                    context.level
        }

    ];


    /*
    =====================================================
    BUILD CONTEXT
    =====================================================

    One data snapshot is built before evaluating all
    achievements so we do not repeatedly scan history.
    =====================================================
    */

    function buildContext() {

        const history =
            typeof getActivityHistory ===
            "function"
                ?
                getActivityHistory()
                :
                [];


        const solved =
            history.filter(
                activity =>
                    activity.solved ===
                    true
            );


        const hardSolves =
            solved.filter(
                activity =>
                    activity.difficulty ===
                    "Hard"
            ).length;


        const zeroHintSolves =
            solved.filter(
                activity =>
                    getHints(
                        activity
                    )
                    ===
                    0
            ).length;


        const firstGuessSolves =
            solved.filter(
                activity =>
                    getGuesses(
                        activity
                    )
                    ===
                    1
            ).length;


        const cleanSolves =
            solved.filter(
                activity =>
                    getGuesses(
                        activity
                    )
                    ===
                    1
                    &&
                    getHints(
                        activity
                    )
                    ===
                    0
            ).length;


        const fastEasySolves =
            solved.filter(
                activity =>
                    activity.difficulty ===
                    "Easy"
                    &&
                    getTime(
                        activity
                    )
                    >
                    0
                    &&
                    getTime(
                        activity
                    )
                    <=
                    30
            ).length;


        const fastMediumSolves =
            solved.filter(
                activity =>
                    activity.difficulty ===
                    "Medium"
                    &&
                    getTime(
                        activity
                    )
                    >
                    0
                    &&
                    getTime(
                        activity
                    )
                    <=
                    60
            ).length;


        const fastHardSolves =
            solved.filter(
                activity =>
                    activity.difficulty ===
                    "Hard"
                    &&
                    getTime(
                        activity
                    )
                    >
                    0
                    &&
                    getTime(
                        activity
                    )
                    <=
                    90
            ).length;


        /*
        ---------------------------------------------
        STREAK DATA
        ---------------------------------------------
        */

        let dailyStreak = {

            current:
                0,

            longest:
                0

        };


        let activityStreak = {

            current:
                0,

            longest:
                0

        };


        if (
            typeof StreakEngine !==
            "undefined"
        ) {

            dailyStreak =
                StreakEngine
                    .getDailyStreak();


            activityStreak =
                StreakEngine
                    .getActivityStreak();
        }


        /*
        ---------------------------------------------
        MASTERY DATA
        ---------------------------------------------
        */

        let mastery =
            [];


        if (
            typeof MasteryEngine !==
            "undefined"
        ) {

            mastery =
                MasteryEngine
                    .getAllMastery();
        }


        const practiced =
            mastery.filter(
                item =>
                    item.attempts >
                    0
            );


        const highestMastery =
            mastery.length
                ?
                Math.max(
                    0,
                    ...mastery.map(
                        item =>
                            Number(
                                item.mastery
                            )
                            ||
                            0
                    )
                )
                :
                0;


        const ciphersAbove75 =
            mastery.filter(
                item =>
                    item.mastery >=
                    75
            ).length;


        /*
        ---------------------------------------------
        LEVEL DATA
        ---------------------------------------------
        */

        let level =
            1;


        let totalXP =
            0;


        if (
            typeof ProgressionEngine !==
            "undefined"
        ) {

            const progression =
                ProgressionEngine
                    .getProgressSummary();


            level =
                progression.level;


            totalXP =
                progression.totalXP;
        }


        return {

            history,

            solvedHistory:
                solved,

            totalAttempts:
                history.length,

            totalSolved:
                solved.length,

            hardSolves,

            zeroHintSolves,

            firstGuessSolves,

            cleanSolves,

            fastEasySolves,

            fastMediumSolves,

            fastHardSolves,

            currentDailyStreak:
                dailyStreak.current
                ||
                0,

            longestDailyStreak:
                dailyStreak.longest
                ||
                0,

            currentActivityStreak:
                activityStreak.current
                ||
                0,

            longestActivityStreak:
                activityStreak.longest
                ||
                0,

            mastery,

            highestMastery,

            ciphersAbove75,

            ciphersPracticed:
                practiced.length,

            level,

            totalXP

        };
    }


    /*
    =====================================================
    EVALUATE ONE ACHIEVEMENT
    =====================================================
    */

    function evaluateAchievement(
        definition,
        context
    ) {

        let progress =
            0;


        try {

            progress =
                Number(
                    definition.metric(
                        context
                    )
                )
                ||
                0;

        } catch (
            error
        ) {

            console.warn(
                `Could not evaluate achievement: ${definition.id}`,
                error
            );


            progress =
                0;
        }


        const target =
            Math.max(
                1,
                Number(
                    definition.target
                )
                ||
                1
            );


        const unlocked =
            progress >=
            target;


        const progressPercent =
            Math.min(
                100,
                Math.max(
                    0,
                    Math.round(
                        progress
                        /
                        target
                        *
                        100
                    )
                )
            );


        return {

            id:
                definition.id,

            name:
                definition.name,

            description:
                definition.description,

            category:
                definition.category,

            tier:
                definition.tier,

            hidden:
                definition.hidden ===
                true,

            target,

            progress,

            progressPercent,

            unlocked

        };
    }


    /*
    =====================================================
    GET ALL ACHIEVEMENTS
    =====================================================
    */

    function getAllAchievements() {

        const context =
            buildContext();


        const savedState =
            loadState();


        return ACHIEVEMENTS.map(
            definition => {

                const result =
                    evaluateAchievement(
                        definition,
                        context
                    );


                const saved =
                    savedState.unlocked[
                        definition.id
                    ];


                return {

                    ...result,

                    unlockedAt:
                        saved
                        ?.unlockedAt
                        ||
                        null,

                    seen:
                        saved
                        ?.seen
                        ===
                        true

                };

            }
        );
    }


    /*
    =====================================================
    UNLOCK SYNC
    =====================================================

    Evaluates current achievement state and permanently
    records the first time an achievement is unlocked.

    Returns achievements that became newly unlocked during
    this call.

    12E-3 will use this for toast notifications.
    =====================================================
    */

    function syncUnlocks() {

        const context =
            buildContext();


        const state =
            loadState();


        const newlyUnlocked =
            [];


        ACHIEVEMENTS.forEach(
            definition => {

                const evaluated =
                    evaluateAchievement(
                        definition,
                        context
                    );


                if (
                    !evaluated.unlocked
                ) {

                    return;
                }


                const existing =
                    state.unlocked[
                        definition.id
                    ];


                if (
                    existing
                ) {

                    return;
                }


                const record = {

                    unlockedAt:
                        new Date()
                            .toISOString(),

                    seen:
                        false

                };


                state.unlocked[
                    definition.id
                ] =
                    record;


                newlyUnlocked.push({

                    ...evaluated,

                    unlockedAt:
                        record.unlockedAt,

                    seen:
                        false

                });

            }
        );


        saveState(
            state
        );


        return newlyUnlocked;
    }


    /*
    =====================================================
    GET UNLOCKED
    =====================================================
    */

    function getUnlockedAchievements() {

        syncUnlocks();


        return getAllAchievements()
            .filter(
                achievement =>
                    achievement.unlocked
            );
    }


    /*
    =====================================================
    GET LOCKED
    =====================================================
    */

    function getLockedAchievements() {

        syncUnlocks();


        return getAllAchievements()
            .filter(
                achievement =>
                    !achievement.unlocked
            );
    }


    /*
    =====================================================
    GET BY CATEGORY
    =====================================================
    */

    function getAchievementsByCategory(
        category
    ) {

        const normalized =
            String(
                category
                ||
                ""
            )
            .toLowerCase();


        return getAllAchievements()
            .filter(
                achievement =>
                    achievement.category ===
                    normalized
            );
    }


    /*
    =====================================================
    GET ONE ACHIEVEMENT
    =====================================================
    */

    function getAchievement(
        id
    ) {

        const normalized =
            String(
                id
                ||
                ""
            )
            .toLowerCase();


        return getAllAchievements()
            .find(
                achievement =>
                    achievement.id ===
                    normalized
            )
            ||
            null;
    }


    /*
    =====================================================
    UNSEEN UNLOCKS
    =====================================================
    */

    function getUnseenAchievements() {

        syncUnlocks();


        return getAllAchievements()
            .filter(
                achievement =>
                    achievement.unlocked
                    &&
                    achievement.seen !==
                    true
            );
    }


    /*
    =====================================================
    MARK SEEN
    =====================================================
    */

    function markAchievementSeen(
        id
    ) {

        const state =
            loadState();


        const record =
            state.unlocked[
                id
            ];


        if (
            !record
        ) {

            return false;
        }


        record.seen =
            true;


        saveState(
            state
        );


        return true;
    }


    function markAllSeen() {

        const state =
            loadState();


        Object.values(
            state.unlocked
        )
        .forEach(
            record => {

                record.seen =
                    true;

            }
        );


        saveState(
            state
        );
    }


    /*
    =====================================================
    SUMMARY
    =====================================================
    */

    function getSummary() {

        syncUnlocks();


        const all =
            getAllAchievements();


        const unlocked =
            all.filter(
                achievement =>
                    achievement.unlocked
            );


        const unseen =
            unlocked.filter(
                achievement =>
                    achievement.seen !==
                    true
            );


        const byTier = {

            bronze:
                0,

            silver:
                0,

            gold:
                0,

            platinum:
                0

        };


        unlocked.forEach(
            achievement => {

                if (
                    byTier[
                        achievement.tier
                    ]
                    !==
                    undefined
                ) {

                    byTier[
                        achievement.tier
                    ]++;
                }

            }
        );


        return {

            total:
                all.length,

            unlocked:
                unlocked.length,

            locked:
                all.length
                -
                unlocked.length,

            unseen:
                unseen.length,

            completionPercent:
                all.length ===
                0
                    ?
                    0
                    :
                    Math.round(
                        unlocked.length
                        /
                        all.length
                        *
                        100
                    ),

            byTier

        };
    }


    /*
    =====================================================
    RECENTLY UNLOCKED
    =====================================================
    */

    function getRecentlyUnlocked(
        limit = 5
    ) {

        return getUnlockedAchievements()
            .filter(
                achievement =>
                    achievement.unlockedAt
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    new Date(
                        b.unlockedAt
                    )
                    -
                    new Date(
                        a.unlockedAt
                    )
            )
            .slice(
                0,
                Math.max(
                    1,
                    Number(
                        limit
                    )
                    ||
                    5
                )
            );
    }


    /*
    =====================================================
    NEAREST ACHIEVEMENTS
    =====================================================

    Useful later for dashboard recommendations such as:

    "8 / 10 solves — Getting Started"
    =====================================================
    */

    function getNearestLocked(
        limit = 5
    ) {

        return getLockedAchievements()
            .filter(
                achievement =>
                    !achievement.hidden
            )
            .sort(
                (
                    a,
                    b
                ) => {

                    if (
                        b.progressPercent !==
                        a.progressPercent
                    ) {

                        return (
                            b.progressPercent
                            -
                            a.progressPercent
                        );
                    }


                    return (
                        a.target
                        -
                        b.target
                    );

                }
            )
            .slice(
                0,
                Math.max(
                    1,
                    Number(
                        limit
                    )
                    ||
                    5
                )
            );
    }


    /*
    =====================================================
    STORAGE
    =====================================================
    */

    function getDefaultState() {

        return {

            version:
                1,

            unlocked:
                {}

        };
    }


    function loadState() {

        try {

            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (
                !raw
            ) {

                return getDefaultState();
            }


            const parsed =
                JSON.parse(
                    raw
                );


            return {

                version:
                    1,

                unlocked:
                    (
                        parsed.unlocked
                        &&
                        typeof parsed.unlocked ===
                        "object"
                    )
                        ?
                        parsed.unlocked
                        :
                        {}

            };

        } catch (
            error
        ) {

            console.warn(
                "Could not load achievement state.",
                error
            );


            return getDefaultState();
        }
    }


    function saveState(
        state
    ) {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    state
                )
            );


            return true;

        } catch (
            error
        ) {

            console.warn(
                "Could not save achievement state.",
                error
            );


            return false;
        }
    }


    /*
    =====================================================
    RESET ACHIEVEMENT STATE
    =====================================================

    This removes unlock timestamps / seen status.

    It DOES NOT erase activity history.

    Therefore achievements whose requirements are still
    satisfied will unlock again on the next sync.
    =====================================================
    */

    function resetAchievementState() {

        try {

            localStorage.removeItem(
                STORAGE_KEY
            );


            return true;

        } catch (
            error
        ) {

            return false;
        }
    }


    /*
    =====================================================
    ACTIVITY HELPERS
    =====================================================
    */

    function getHints(
        activity
    ) {

        return Math.max(
            0,
            Number(
                activity.hints
            )
            ||
            0
        );
    }


    function getGuesses(
        activity
    ) {

        return Math.max(
            0,
            Number(
                activity.guesses
            )
            ||
            0
        );
    }


    function getTime(
        activity
    ) {

        return Math.max(
            0,
            Number(
                activity.timeSeconds
            )
            ||
            0
        );
    }


    /*
    =====================================================
    PUBLIC API
    =====================================================
    */

    return {

        getAllAchievements,

        getUnlockedAchievements,

        getLockedAchievements,

        getAchievementsByCategory,

        getAchievement,

        syncUnlocks,

        getUnseenAchievements,

        markAchievementSeen,

        markAllSeen,

        getSummary,

        getRecentlyUnlocked,

        getNearestLocked,

        resetAchievementState

    };


})();