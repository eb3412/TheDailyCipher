const STORAGE_KEY =
    "dailyCipherAnalytics";


/*
=========================================================
DEFAULT PRACTICE STATS
=========================================================
*/

function getDefaultPracticeStats() {

    return {

        totalPlayed: 0,

        totalSolved: 0,

        totalScore: 0,

        totalHints: 0,

        bestScore: 0,

        totalSolveTime: 0,

        timedSolves: 0,

        byCipher: {},

        recent: []

    };
}


/*
=========================================================
DEFAULT GLOBAL STATS
=========================================================
*/

function getDefaultStats() {

    return {

        totalPlayed: 0,

        totalWon: 0,

        totalGuesses: 0,

        currentStreak: 0,

        maxStreak: 0,

        lastSolvedDate: "",

        completedDates: {},

        dailyResults: {},

        activityHistory: [],

        practiceStats:
            getDefaultPracticeStats()

    };
}


/*
=========================================================
LOAD
=========================================================
*/

function loadStats() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!saved) {

        const stats =
            getDefaultStats();


        saveStats(
            stats
        );


        return stats;
    }


    try {

        const parsed =
            JSON.parse(
                saved
            );


        const defaults =
            getDefaultStats();


        return {

    ...defaults,

    ...parsed,

    activityHistory:
        Array.isArray(
            parsed.activityHistory
        )
            ?
            parsed.activityHistory
            :
            [],

    practiceStats: {

        ...defaults.practiceStats,

        ...(
            parsed.practiceStats
            ||
            {}
        ),

        byCipher: {

            ...defaults
                .practiceStats
                .byCipher,

            ...(
                parsed
                    .practiceStats
                    ?.byCipher
                ||
                {}
            )

        },

        recent:
            Array.isArray(
                parsed
                    .practiceStats
                    ?.recent
            )
                ?
                parsed
                    .practiceStats
                    .recent
                :
                []

    }

};


    } catch (
        error
    ) {

        console.error(
            "Storage parse error:",
            error
        );


        const stats =
            getDefaultStats();


        saveStats(
            stats
        );


        return stats;
    }
}


/*
=========================================================
SAVE
=========================================================
*/

function saveStats(
    stats
) {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(
            stats
        )

    );
}


/*
=========================================================
PRACTICE HELPERS
=========================================================
*/

function loadPracticeStats() {

    return loadStats()
        .practiceStats;
}


function savePracticeStats(
    practiceStats
) {

    const stats =
        loadStats();


    stats.practiceStats =
        practiceStats;


    saveStats(
        stats
    );
}


function resetPracticeStats() {

    const stats =
        loadStats();


    stats.practiceStats =
        getDefaultPracticeStats();


    saveStats(
        stats
    );
}


/*
=========================================================
ACTIVITY / SOLVE HISTORY
=========================================================
*/


function createActivityID(
    source = "activity"
) {

    const random =
        Math.random()
            .toString(36)
            .slice(2, 9);


    return (

        `${source}-`
        +
        Date.now()
        +
        "-"
        +
        random

    );
}


/*
=========================================================
NORMALIZE ACTIVITY
=========================================================
*/

function normalizeActivityRecord(
    record = {}
) {

    const source =
        String(
            record.source
            ||
            "unknown"
        )
        .toLowerCase();


    const cipher =
        String(
            record.cipher
            ||
            "unknown"
        )
        .toLowerCase();


    const difficulty =
        String(
            record.difficulty
            ||
            "Unknown"
        );


    const score =
        Number(
            record.score
            ||
            0
        );


    const guesses =
        Number(
            record.guesses
            ??
            record.guessesUsed
            ??
            0
        );


    const hints =
        Number(
            record.hints
            ??
            record.hintCount
            ??
            0
        );


    const timeSeconds =
        Number(
            record.timeSeconds
            ??
            record.elapsedSeconds
            ??
            0
        );


    return {

        id:
            record.id
            ||
            createActivityID(
                source
            ),

        source,

        cipher,

        difficulty,

        solved:
            record.solved
            ===
            true,

        score:
            Number.isFinite(
                score
            )
                ?
                score
                :
                0,

        guesses:
            Number.isFinite(
                guesses
            )
                ?
                guesses
                :
                0,

        hints:
            Number.isFinite(
                hints
            )
                ?
                hints
                :
                0,

        timeSeconds:
            Number.isFinite(
                timeSeconds
            )
                ?
                timeSeconds
                :
                0,

        mode:
            record.mode
            ?
            String(
                record.mode
            )
            :
            null,

        date:
            record.date
            ||
            new Date()
                .toISOString()
                .slice(
                    0,
                    10
                ),

        timestamp:
            record.timestamp
            ||
            new Date()
                .toISOString(),

        metadata:
            (
                record.metadata
                &&
                typeof record.metadata
                ===
                "object"
            )
                ?
                record.metadata
                :
                {}

    };
}


/*
=========================================================
RECORD ACTIVITY
=========================================================
*/

function recordActivity(
    record
) {

    const stats =
        loadStats();


    if (
        !Array.isArray(
            stats.activityHistory
        )
    ) {

        stats.activityHistory =
            [];
    }


    const activity =
        normalizeActivityRecord(
            record
        );


    /*
    Avoid accidental duplicate recording.
    */

    const duplicate =
        stats.activityHistory
            .some(
                existing =>
                    existing.id
                    ===
                    activity.id
            );


    if (
        duplicate
    ) {

        return activity;
    }


    stats.activityHistory.unshift(
        activity
    );


    /*
    Cap localStorage growth.

    2,000 records is plenty for now and avoids
    letting activity history grow forever.
    */

    stats.activityHistory =
        stats.activityHistory
            .slice(
                0,
                2000
            );


    saveStats(
        stats
    );


    return activity;
}


/*
=========================================================
GET ACTIVITY
=========================================================
*/

function getActivityHistory(
    options = {}
) {

    const stats =
        loadStats();


    let history =
        Array.isArray(
            stats.activityHistory
        )
            ?
            [
                ...stats.activityHistory
            ]
            :
            [];


    /*
    Source filter.
    */

    if (
        options.source
    ) {

        const source =
            String(
                options.source
            )
            .toLowerCase();


        history =
            history.filter(
                item =>
                    item.source
                    ===
                    source
            );
    }


    /*
    Cipher filter.
    */

    if (
        options.cipher
    ) {

        const cipher =
            String(
                options.cipher
            )
            .toLowerCase();


        history =
            history.filter(
                item =>
                    item.cipher
                    ===
                    cipher
            );
    }


    /*
    Difficulty filter.
    */

    if (
        options.difficulty
    ) {

        history =
            history.filter(
                item =>
                    item.difficulty
                    ===
                    options.difficulty
            );
    }


    /*
    Solved filter.
    */

    if (
        typeof options.solved
        ===
        "boolean"
    ) {

        history =
            history.filter(
                item =>
                    item.solved
                    ===
                    options.solved
            );
    }


    /*
    Limit.
    */

    if (
        Number.isInteger(
            options.limit
        )
        &&
        options.limit > 0
    ) {

        history =
            history.slice(
                0,
                options.limit
            );
    }


    return history;
}


/*
=========================================================
ACTIVITY SUMMARY
=========================================================
*/

function getActivitySummary() {

    const history =
        getActivityHistory();


    const totalAttempts =
        history.length;


    const solved =
        history.filter(
            item =>
                item.solved
        );


    const totalSolved =
        solved.length;


    const solveRate =
        totalAttempts ===
        0
            ?
            0
            :
            Math.round(
                (
                    totalSolved
                    /
                    totalAttempts
                )
                *
                100
            );


    const totalScore =
        solved.reduce(
            (
                sum,
                item
            ) =>
                sum
                +
                (
                    Number(
                        item.score
                    )
                    ||
                    0
                ),
            0
        );


    const totalSolveTime =
        solved.reduce(
            (
                sum,
                item
            ) =>
                sum
                +
                (
                    Number(
                        item.timeSeconds
                    )
                    ||
                    0
                ),
            0
        );


    const averageSolveTime =
        totalSolved ===
        0
            ?
            0
            :
            Math.round(
                totalSolveTime
                /
                totalSolved
            );


    return {

        totalAttempts,

        totalSolved,

        solveRate,

        totalScore,

        totalSolveTime,

        averageSolveTime

    };
}


/*
=========================================================
ACTIVITY BY CIPHER
=========================================================
*/

function getActivityByCipher() {

    const history =
        getActivityHistory();


    const result =
        {};


    history.forEach(
        item => {

            if (
                !result[
                    item.cipher
                ]
            ) {

                result[
                    item.cipher
                ] = {

                    cipher:
                        item.cipher,

                    attempts:
                        0,

                    solved:
                        0,

                    score:
                        0,

                    totalTime:
                        0

                };
            }


            const entry =
                result[
                    item.cipher
                ];


            entry.attempts++;


            if (
                item.solved
            ) {

                entry.solved++;

                entry.score +=
                    Number(
                        item.score
                    )
                    ||
                    0;


                entry.totalTime +=
                    Number(
                        item.timeSeconds
                    )
                    ||
                    0;
            }

        }
    );


    Object.values(
        result
    )
    .forEach(
        entry => {

            entry.solveRate =
                entry.attempts ===
                0
                    ?
                    0
                    :
                    Math.round(
                        entry.solved
                        /
                        entry.attempts
                        *
                        100
                    );


            entry.averageSolveTime =
                entry.solved ===
                0
                    ?
                    0
                    :
                    Math.round(
                        entry.totalTime
                        /
                        entry.solved
                    );

        }
    );


    return result;
}


/*
=========================================================
CLEAR ACTIVITY HISTORY
=========================================================
*/

function clearActivityHistory() {

    const stats =
        loadStats();


    stats.activityHistory =
        [];


    saveStats(
        stats
    );
}