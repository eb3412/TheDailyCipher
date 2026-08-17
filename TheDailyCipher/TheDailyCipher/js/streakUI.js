/*
=========================================================
THE DAILY CIPHER
STREAK UI v1.0
=========================================================
*/


const StreakUI = (() => {


    function update() {

        if (
            typeof StreakEngine
            ===
            "undefined"
        ) {

            return;
        }


        const summary =
            StreakEngine
                .getStreakSummary();


        renderDaily(
            summary.daily
        );


        renderActivity(
            summary.activity
        );
    }


    /*
    =====================================================
    DAILY
    =====================================================
    */

    function renderDaily(
        streak
    ) {

        setText(
            "daily-streak-current",
            streak.current
        );


        setText(
            "daily-streak-best",
            `Best ${streak.longest}`
        );


        setText(
            "daily-streak-status",
            streak.completedToday
                ?
                "Daily completed today"
                :
                getDailyStatus(
                    streak
                )
        );
    }


    /*
    =====================================================
    ACTIVITY
    =====================================================
    */

    function renderActivity(
        streak
    ) {

        setText(
            "activity-streak-current",
            streak.current
        );


        setText(
            "activity-streak-best",
            `Best ${streak.longest}`
        );


        setText(
            "activity-streak-status",
            streak.completedToday
                ?
                "Active today"
                :
                getActivityStatus(
                    streak
                )
        );
    }


    /*
    =====================================================
    STATUS
    =====================================================
    */

    function getDailyStatus(
        streak
    ) {

        if (
            streak.current >
            0
        ) {

            return "Complete today's Daily to continue";
        }


        if (
            streak.totalActiveDays >
            0
        ) {

            return "Start a new Daily streak";
        }


        return "Complete your first Daily";
    }


    function getActivityStatus(
        streak
    ) {

        if (
            streak.current >
            0
        ) {

            return "Solve something today to continue";
        }


        if (
            streak.totalActiveDays >
            0
        ) {

            return "Start a new activity streak";
        }


        return "Complete your first puzzle";
    }


    /*
    =====================================================
    HELPER
    =====================================================
    */

    function setText(
        id,
        value
    ) {

        const element =
            document.getElementById(
                id
            );


        if (
            element
        ) {

            element.textContent =
                value;
        }
    }


    /*
    =====================================================
    PUBLIC
    =====================================================
    */

    return {

        update

    };


})();