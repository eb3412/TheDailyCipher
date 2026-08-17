/*
=========================================================
THE DAILY CIPHER
STREAK ENGINE v1.0
=========================================================

Tracks two different streaks:

1. Daily Streak
   Consecutive days where the Daily system records
   completion.

2. Activity Streak
   Consecutive days where the user completes at least
   one Practice OR Daily activity.

Important:
Practice cannot artificially increase the Daily Streak.
=========================================================
*/


const StreakEngine = (() => {


    /*
    =====================================================
    DATE HELPERS
    =====================================================
    */

    function getTodayKey() {

        const now =
            new Date();


        return formatLocalDate(
            now
        );
    }


    function formatLocalDate(
        date
    ) {

        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth()
                +
                1
            )
            .padStart(
                2,
                "0"
            );


        const day =
            String(
                date.getDate()
            )
            .padStart(
                2,
                "0"
            );


        return (
            `${year}-${month}-${day}`
        );
    }


    function parseDateKey(
        key
    ) {

        if (
            typeof key !==
            "string"
        ) {

            return null;
        }


        const match =
            key.match(
                /^(\d{4})-(\d{2})-(\d{2})$/
            );


        if (
            !match
        ) {

            return null;
        }


        const year =
            Number(
                match[1]
            );


        const month =
            Number(
                match[2]
            )
            -
            1;


        const day =
            Number(
                match[3]
            );


        const date =
            new Date(
                year,
                month,
                day
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return null;
        }


        return date;
    }


    function shiftDateKey(
        key,
        amount
    ) {

        const date =
            parseDateKey(
                key
            );


        if (
            !date
        ) {

            return null;
        }


        date.setDate(
            date.getDate()
            +
            amount
        );


        return formatLocalDate(
            date
        );
    }


    function normalizeDateKey(
        value
    ) {

        if (
            typeof value !==
            "string"
        ) {

            return null;
        }


        /*
        Already YYYY-MM-DD.
        */

        if (
            /^\d{4}-\d{2}-\d{2}$/
                .test(
                    value
                )
        ) {

            return value;
        }


        /*
        ISO timestamp.
        */

        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return null;
        }


        return formatLocalDate(
            date
        );
    }


    /*
    =====================================================
    DAILY COMPLETION DATES
    =====================================================

    Uses the Daily system's existing completedDates data.

    That means this respects whatever your Daily system
    already considers a completed Daily challenge.
    =====================================================
    */

    function getDailyCompletionDates() {

        if (
            typeof loadStats !==
            "function"
        ) {

            return [];
        }


        const stats =
            loadStats();


        const dates =
            new Set();


        /*
        Primary source.
        */

        if (
            stats.completedDates
            &&
            typeof stats.completedDates
            ===
            "object"
        ) {

            Object.entries(
                stats.completedDates
            )
            .forEach(
                (
                    [
                        date,
                        completed
                    ]
                ) => {

                    if (
                        !completed
                    ) {

                        return;
                    }


                    const normalized =
                        normalizeDateKey(
                            date
                        );


                    if (
                        normalized
                    ) {

                        dates.add(
                            normalized
                        );
                    }

                }
            );
        }


        /*
        Fallback:
        Check dailyResults if completedDates is missing
        or older saved data used a different structure.
        */

        if (
            stats.dailyResults
            &&
            typeof stats.dailyResults
            ===
            "object"
        ) {

            Object.entries(
                stats.dailyResults
            )
            .forEach(
                (
                    [
                        date,
                        result
                    ]
                ) => {

                    if (
                        !containsCompletion(
                            result
                        )
                    ) {

                        return;
                    }


                    const normalized =
                        normalizeDateKey(
                            date
                        );


                    if (
                        normalized
                    ) {

                        dates.add(
                            normalized
                        );
                    }

                }
            );
        }


        return sortDateKeys(
            [
                ...dates
            ]
        );
    }


    /*
    =====================================================
    ACTIVITY COMPLETION DATES
    =====================================================

    Activity streak counts:

    - successful Practice solves
    - successful Daily activities
    - Daily dates already stored by the older Daily system
    =====================================================
    */

    function getActivityCompletionDates() {

        const dates =
            new Set(
                getDailyCompletionDates()
            );


        if (
            typeof getActivityHistory ===
            "function"
        ) {

            const history =
                getActivityHistory();


            history.forEach(
                activity => {

                    if (
                        activity.solved !==
                        true
                    ) {

                        return;
                    }


                    const normalized =
                        normalizeDateKey(
                            activity.date
                            ||
                            activity.timestamp
                        );


                    if (
                        normalized
                    ) {

                        dates.add(
                            normalized
                        );
                    }

                }
            );
        }


        return sortDateKeys(
            [
                ...dates
            ]
        );
    }


    /*
    =====================================================
    CURRENT STREAK
    =====================================================

    If the user completed something yesterday but has
    not done today's challenge yet, the streak remains
    active.

    It becomes 0 only after missing a full calendar day.
    =====================================================
    */

    function calculateCurrentStreak(
        dates
    ) {

        const unique =
            new Set(
                dates
            );


        if (
            unique.size ===
            0
        ) {

            return 0;
        }


        const today =
            getTodayKey();


        const yesterday =
            shiftDateKey(
                today,
                -1
            );


        let cursor;


        if (
            unique.has(
                today
            )
        ) {

            cursor =
                today;

        } else if (
            unique.has(
                yesterday
            )
        ) {

            cursor =
                yesterday;

        } else {

            return 0;
        }


        let streak =
            0;


        while (
            cursor
            &&
            unique.has(
                cursor
            )
        ) {

            streak++;


            cursor =
                shiftDateKey(
                    cursor,
                    -1
                );
        }


        return streak;
    }


    /*
    =====================================================
    LONGEST STREAK
    =====================================================
    */

    function calculateLongestStreak(
        dates
    ) {

        const sorted =
            sortDateKeys(
                [
                    ...new Set(
                        dates
                    )
                ]
            );


        if (
            sorted.length ===
            0
        ) {

            return 0;
        }


        let longest =
            1;


        let current =
            1;


        for (
            let i = 1;
            i < sorted.length;
            i++
        ) {

            const expected =
                shiftDateKey(
                    sorted[
                        i - 1
                    ],
                    1
                );


            if (
                sorted[i]
                ===
                expected
            ) {

                current++;


                longest =
                    Math.max(
                        longest,
                        current
                    );

            } else {

                current =
                    1;
            }
        }


        return longest;
    }


    /*
    =====================================================
    DAILY SUMMARY
    =====================================================
    */

    function getDailyStreak() {

        const dates =
            getDailyCompletionDates();


        const today =
            getTodayKey();


        return {

            type:
                "daily",

            current:
                calculateCurrentStreak(
                    dates
                ),

            longest:
                calculateLongestStreak(
                    dates
                ),

            completedToday:
                dates.includes(
                    today
                ),

            totalActiveDays:
                dates.length,

            lastActiveDate:
                dates.length
                    ?
                    dates[
                        dates.length - 1
                    ]
                    :
                    null

        };
    }


    /*
    =====================================================
    ACTIVITY SUMMARY
    =====================================================
    */

    function getActivityStreak() {

        const dates =
            getActivityCompletionDates();


        const today =
            getTodayKey();


        return {

            type:
                "activity",

            current:
                calculateCurrentStreak(
                    dates
                ),

            longest:
                calculateLongestStreak(
                    dates
                ),

            completedToday:
                dates.includes(
                    today
                ),

            totalActiveDays:
                dates.length,

            lastActiveDate:
                dates.length
                    ?
                    dates[
                        dates.length - 1
                    ]
                    :
                    null

        };
    }


    /*
    =====================================================
    COMPLETE SUMMARY
    =====================================================
    */

    function getStreakSummary() {

        return {

            daily:
                getDailyStreak(),

            activity:
                getActivityStreak()

        };
    }


    /*
    =====================================================
    FALLBACK COMPLETION DETECTION
    =====================================================
    */

    function containsCompletion(
        value,
        depth = 0
    ) {

        if (
            depth >
            5
        ) {

            return false;
        }


        if (
            value ===
            true
        ) {

            return true;
        }


        if (
            !value
            ||
            typeof value !==
            "object"
        ) {

            return false;
        }


        if (
            value.solved ===
            true
            ||
            value.completed ===
            true
            ||
            value.won ===
            true
        ) {

            return true;
        }


        return Object.values(
            value
        )
        .some(
            child =>
                containsCompletion(
                    child,
                    depth + 1
                )
        );
    }


    /*
    =====================================================
    SORT DATES
    =====================================================
    */

    function sortDateKeys(
        dates
    ) {

        return dates
            .filter(
                date =>
                    /^\d{4}-\d{2}-\d{2}$/
                        .test(
                            date
                        )
            )
            .sort();
    }


    /*
    =====================================================
    PUBLIC API
    =====================================================
    */

    return {

        getTodayKey,

        getDailyCompletionDates,

        getActivityCompletionDates,

        calculateCurrentStreak,

        calculateLongestStreak,

        getDailyStreak,

        getActivityStreak,

        getStreakSummary

    };


})();