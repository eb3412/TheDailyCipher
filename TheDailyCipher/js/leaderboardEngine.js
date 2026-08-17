/*
=========================================================
THE DAILY CIPHER
LEADERBOARD ENGINE v2.0
=========================================================

Supports:

- All-time leaderboard
- Current-week leaderboard
- Current-month leaderboard
- Current-user rank
- Pagination
- Guests
- Supabase RPCs

=========================================================
*/


window.LeaderboardEngine = (() => {


    const DEFAULT_LIMIT =
        25;


    const MAX_LIMIT =
        100;


    const VALID_PERIODS =
        new Set([
            "all",
            "week",
            "month"
        ]);


    let leaderboardCache =
        [];


    let currentUserRank =
        null;


    let currentPeriod =
        "all";


    let lastOffset =
        0;


    let lastLimit =
        DEFAULT_LIMIT;


    let loading =
        false;


    /*
    =====================================================
    INITIALIZE
    =====================================================
    */

    async function initialize() {

        return refresh();
    }


    /*
    =====================================================
    PERIOD
    =====================================================
    */

    function setPeriod(
        period
    ) {

        currentPeriod =
            normalizePeriod(
                period
            );


        lastOffset =
            0;


        return currentPeriod;
    }


    function getPeriod() {

        return currentPeriod;
    }


    /*
    =====================================================
    REFRESH
    =====================================================
    */

    async function refresh(
        options = {}
    ) {

        if (
            !window.supabaseClient
        ) {

            return {

                success:
                    false,

                error:
                    new Error(
                        "Supabase client unavailable."
                    )

            };
        }


        const period =
            normalizePeriod(
                options.period
                ??
                currentPeriod
            );


        const limit =
            normalizeLimit(
                options.limit
            );


        const offset =
            normalizeOffset(
                options.offset
            );


        if (
            loading
        ) {

            return {

                success:
                    false,

                loading:
                    true,

                leaderboard:
                    leaderboardCache,

                currentUser:
                    currentUserRank,

                period:
                    currentPeriod

            };
        }


        loading =
            true;


        try {

            currentPeriod =
                period;


            const board =
                await fetchLeaderboard({

                    period,

                    limit,

                    offset

                });


            if (
                !board.success
            ) {

                return board;
            }


            const mine =
                await fetchMyRank(
                    period
                );


            leaderboardCache =
                board.data;


            currentUserRank =
                mine.success
                    ?
                    mine.data
                    :
                    null;


            lastLimit =
                limit;


            lastOffset =
                offset;


            const result = {

                success:
                    true,

                leaderboard:
                    leaderboardCache,

                currentUser:
                    currentUserRank,

                period,

                limit,

                offset

            };


            dispatchUpdate(
                result
            );


            return result;


        } catch (
            error
        ) {

            console.error(
                "Leaderboard refresh failed:",
                error
            );


            return {

                success:
                    false,

                error,

                leaderboard:
                    leaderboardCache,

                currentUser:
                    currentUserRank,

                period:
                    currentPeriod

            };


        } finally {

            loading =
                false;
        }
    }


    /*
    =====================================================
    FETCH LEADERBOARD
    =====================================================
    */

    async function fetchLeaderboard({

        period =
            currentPeriod,

        limit =
            DEFAULT_LIMIT,

        offset =
            0

    } = {}) {

        const safePeriod =
            normalizePeriod(
                period
            );


        const {
            data,
            error
        } =
            await supabaseClient
                .rpc(
                    "get_leaderboard_period",
                    {

                        p_period:
                            safePeriod,

                        p_limit:
                            normalizeLimit(
                                limit
                            ),

                        p_offset:
                            normalizeOffset(
                                offset
                            )

                    }
                );


        if (
            error
        ) {

            console.error(
                "Leaderboard query error:",
                error
            );


            return {

                success:
                    false,

                error,

                data:
                    []

            };
        }


        return {

            success:
                true,

            data:
                (
                    Array.isArray(
                        data
                    )
                        ?
                        data.map(
                            normalizeLeaderboardRow
                        )
                        :
                        []
                )

        };
    }


    /*
    =====================================================
    FETCH MY RANK
    =====================================================
    */

    async function fetchMyRank(
        period =
            currentPeriod
    ) {

        const {
            data:
                sessionData,
            error:
                sessionError
        } =
            await supabaseClient
                .auth
                .getSession();


        if (
            sessionError
        ) {

            return {

                success:
                    false,

                data:
                    null,

                error:
                    sessionError

            };
        }


        if (
            !sessionData
                ?.session
                ?.user
        ) {

            return {

                success:
                    true,

                signedIn:
                    false,

                data:
                    null

            };
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .rpc(
                    "get_my_leaderboard_rank_period",
                    {

                        p_period:
                            normalizePeriod(
                                period
                            )

                    }
                );


        if (
            error
        ) {

            console.error(
                "My rank query error:",
                error
            );


            return {

                success:
                    false,

                signedIn:
                    true,

                data:
                    null,

                error

            };
        }


        return {

            success:
                true,

            signedIn:
                true,

            data:
                (
                    Array.isArray(
                        data
                    )
                    &&
                    data.length >
                    0
                )
                    ?
                    normalizeMyRankRow(
                        data[0]
                    )
                    :
                    null

        };
    }


    /*
    =====================================================
    PAGINATION
    =====================================================
    */

    async function nextPage() {

        return refresh({

            period:
                currentPeriod,

            limit:
                lastLimit,

            offset:
                lastOffset
                +
                lastLimit

        });
    }


    async function previousPage() {

        return refresh({

            period:
                currentPeriod,

            limit:
                lastLimit,

            offset:
                Math.max(
                    0,
                    lastOffset
                    -
                    lastLimit
                )

        });
    }


    /*
    =====================================================
    NORMALIZATION
    =====================================================
    */

    function normalizeLeaderboardRow(
        row
    ) {

        return {

            rank:
                safeInteger(
                    row?.rank_position
                ),

            username:
                String(
                    row?.username
                    ||
                    ""
                ),

            displayName:
                String(
                    row?.display_name
                    ||
                    ""
                ),

            totalXP:
                safeInteger(
                    row?.total_xp
                ),

            level:
                Math.max(
                    1,
                    safeInteger(
                        row?.level
                    )
                ),

            totalSolved:
                safeInteger(
                    row?.total_solved
                ),

            totalAttempts:
                safeInteger(
                    row?.total_attempts
                )

        };
    }


    function normalizeMyRankRow(
        row
    ) {

        return {

            rank:
                safeInteger(
                    row?.rank_position
                ),

            username:
                String(
                    row?.username
                    ||
                    ""
                ),

            totalXP:
                safeInteger(
                    row?.total_xp
                ),

            level:
                Math.max(
                    1,
                    safeInteger(
                        row?.level
                    )
                ),

            totalSolved:
                safeInteger(
                    row?.total_solved
                ),

            totalAttempts:
                safeInteger(
                    row?.total_attempts
                )

        };
    }


    function normalizePeriod(
        value
    ) {

        const period =
            String(
                value
                ||
                "all"
            )
            .toLowerCase();


        return VALID_PERIODS.has(
            period
        )
            ?
            period
            :
            "all";
    }


    function normalizeLimit(
        value
    ) {

        const number =
            Number(
                value
            );


        if (
            !Number.isFinite(
                number
            )
        ) {

            return DEFAULT_LIMIT;
        }


        return Math.min(
            MAX_LIMIT,
            Math.max(
                1,
                Math.floor(
                    number
                )
            )
        );
    }


    function normalizeOffset(
        value
    ) {

        const number =
            Number(
                value
            );


        return Number.isFinite(
            number
        )
            ?
            Math.max(
                0,
                Math.floor(
                    number
                )
            )
            :
            0;
    }


    function safeInteger(
        value
    ) {

        const number =
            Number(
                value
            );


        return Number.isFinite(
            number
        )
            ?
            Math.max(
                0,
                Math.round(
                    number
                )
            )
            :
            0;
    }


    /*
    =====================================================
    EVENT
    =====================================================
    */

    function dispatchUpdate(
        detail
    ) {

        window.dispatchEvent(
            new CustomEvent(
                "tdc-leaderboard-update",
                {
                    detail
                }
            )
        );
    }


    /*
    =====================================================
    STATE
    =====================================================
    */

    function getLeaderboard() {

        return [
            ...leaderboardCache
        ];
    }


    function getMyRank() {

        return currentUserRank
            ?
            {
                ...currentUserRank
            }
            :
            null;
    }


    function getState() {

        return {

            leaderboard:
                getLeaderboard(),

            currentUser:
                getMyRank(),

            period:
                currentPeriod,

            loading,

            limit:
                lastLimit,

            offset:
                lastOffset,

            page:
                Math.floor(
                    lastOffset
                    /
                    lastLimit
                )
                +
                1

        };
    }


    /*
    =====================================================
    PUBLIC
    =====================================================
    */

    return {

        initialize,

        refresh,

        fetchLeaderboard,

        fetchMyRank,

        setPeriod,

        getPeriod,

        nextPage,

        previousPage,

        getLeaderboard,

        getMyRank,

        getState

    };


})();
