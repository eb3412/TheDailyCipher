/*
=========================================================
THE DAILY CIPHER
LEADERBOARD UI v2.0
=========================================================

Adds:

- All-Time
- This Week
- This Month
- Period-aware ranking
- Current-user ranking
- Pagination

=========================================================
*/


window.LeaderboardUI = (() => {


    const PAGE_SIZE =
        25;


    let currentPage =
        1;


    let currentPeriod =
        "all";


    let currentRows =
        [];


    let currentUser =
        null;


    /*
    =====================================================
    INITIALIZE
    =====================================================
    */

    async function initialize() {

        installFilterStyles();

        createPeriodControls();

        bindEvents();


        await refresh();
    }


    /*
    =====================================================
    PERIOD CONTROLS
    =====================================================
    */

    function createPeriodControls() {

        const toolbar =
            document.querySelector(
                ".leaderboard-toolbar"
            );


        if (
            !toolbar
        ) {

            return;
        }


        const oldMeta =
            toolbar.querySelector(
                ":scope > .leaderboard-toolbar-meta"
            );


        if (
            oldMeta
        ) {

            oldMeta.remove();
        }


        const controls =
            document.createElement(
                "div"
            );


        controls.id =
            "leaderboard-period-controls";


        controls.className =
            "leaderboard-period-controls";


        controls.innerHTML =
            `
                <button
                    type="button"
                    data-period="all"
                    class="leaderboard-period-button active"
                >
                    All-Time
                </button>

                <button
                    type="button"
                    data-period="week"
                    class="leaderboard-period-button"
                >
                    This Week
                </button>

                <button
                    type="button"
                    data-period="month"
                    class="leaderboard-period-button"
                >
                    This Month
                </button>
            `;


        toolbar.appendChild(
            controls
        );
    }


    /*
    =====================================================
    EVENTS
    =====================================================
    */

    function bindEvents() {

        document
            .getElementById(
                "leaderboard-refresh"
            )
            ?.addEventListener(
                "click",
                refresh
            );


        document
            .getElementById(
                "leaderboard-previous"
            )
            ?.addEventListener(
                "click",
                previousPage
            );


        document
            .getElementById(
                "leaderboard-next"
            )
            ?.addEventListener(
                "click",
                nextPage
            );


        document
            .getElementById(
                "leaderboard-period-controls"
            )
            ?.addEventListener(
                "click",
                event => {

                    const button =
                        event.target.closest(
                            "[data-period]"
                        );


                    if (
                        !button
                    ) {

                        return;
                    }


                    changePeriod(
                        button.dataset.period
                    );

                }
            );


        window.addEventListener(
            "tdc-cloud-sync-complete",
            refresh
        );
    }


    /*
    =====================================================
    CHANGE PERIOD
    =====================================================
    */

    async function changePeriod(
        period
    ) {

        if (
            period ===
            currentPeriod
        ) {

            return;
        }


        currentPeriod =
            period;


        currentPage =
            1;


        LeaderboardEngine
            .setPeriod(
                period
            );


        updatePeriodButtons();


        await refresh();
    }


    /*
    =====================================================
    REFRESH
    =====================================================
    */

    async function refresh() {

        setLoading(
            true
        );


        const result =
            await LeaderboardEngine
                .refresh({

                    period:
                        currentPeriod,

                    limit:
                        PAGE_SIZE,

                    offset:
                        (
                            currentPage
                            -
                            1
                        )
                        *
                        PAGE_SIZE

                });


        renderResult(
            result
        );


        setLoading(
            false
        );
    }


    /*
    =====================================================
    RESULT
    =====================================================
    */

    function renderResult(
        result
    ) {

        if (
            !result?.success
        ) {

            renderError(
                result?.error
            );


            return;
        }


        currentRows =
            result.leaderboard
            ||
            [];


        currentUser =
            result.currentUser
            ||
            null;


        renderLeaderboard();

        renderMyRank();

        renderPageControls();

        renderSummary();

        updatePeriodButtons();
    }


    /*
    =====================================================
    BOARD
    =====================================================
    */

    function renderLeaderboard() {

        const body =
            document.getElementById(
                "leaderboard-body"
            );


        if (
            !body
        ) {

            return;
        }


        body.innerHTML =
            "";


        if (
            currentRows.length ===
            0
        ) {

            body.innerHTML =
                `
                    <div class="leaderboard-empty">

                        ${
                            currentPeriod ===
                            "all"

                                ?

                                "No ranked players yet."

                                :

                                "No activity has been recorded for this period yet."
                        }

                    </div>
                `;


            return;
        }


        currentRows.forEach(
            player => {

                body.appendChild(
                    createRow(
                        player
                    )
                );

            }
        );
    }


    /*
    =====================================================
    ROW
    =====================================================
    */

    function createRow(
        player
    ) {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "leaderboard-row";


        if (
            currentUser?.username
            &&
            player.username ===
            currentUser.username
        ) {

            row.classList.add(
                "is-current-user"
            );
        }


        row.innerHTML =
            `
                <div class="leaderboard-rank">
                    ${formatRank(player.rank)}
                </div>

                <div class="leaderboard-player">

                    <strong>
                        @${escapeHTML(player.username)}
                    </strong>

                    <span>
                        ${escapeHTML(
                            player.displayName
                            ||
                            "Cipher Solver"
                        )}
                    </span>

                </div>

                <div class="leaderboard-stat">

                    <strong>
                        ${formatNumber(player.level)}
                    </strong>

                    <span>
                        Level
                    </span>

                </div>

                <div class="leaderboard-stat">

                    <strong>
                        ${formatNumber(player.totalSolved)}
                    </strong>

                    <span>
                        Solved
                    </span>

                </div>

                <div class="leaderboard-xp">

                    <strong>
                        ${formatNumber(player.totalXP)}
                    </strong>

                    <span>
                        XP
                    </span>

                </div>
            `;


        return row;
    }


    /*
    =====================================================
    MY RANK
    =====================================================
    */

    function renderMyRank() {

        const card =
            document.getElementById(
                "my-rank-card"
            );


        if (
            !card
        ) {

            return;
        }


        if (
            !currentUser
        ) {

            card.innerHTML =
                `
                    <div class="my-rank-label">
                        YOUR ${periodLabel().toUpperCase()} RANK
                    </div>

                    <div class="my-rank-guest">
                        ${
                            currentPeriod ===
                            "all"

                                ?

                                "Sign in and choose a username to appear on the leaderboard."

                                :

                                "You have no ranked activity for this period, or you are not signed in."
                        }
                    </div>

                    <a
                        href="../account/index.html"
                        class="my-rank-link"
                    >
                        Account
                    </a>
                `;


            return;
        }


        card.innerHTML =
            `
                <div class="my-rank-label">
                    YOUR ${periodLabel().toUpperCase()} RANK
                </div>

                <div class="my-rank-main">

                    <div class="my-rank-position">
                        #${formatNumber(currentUser.rank)}
                    </div>

                    <div>

                        <strong>
                            @${escapeHTML(currentUser.username)}
                        </strong>

                        <span>
                            Level ${formatNumber(currentUser.level)}
                        </span>

                    </div>

                </div>

                <div class="my-rank-stats">

                    <div>
                        <strong>
                            ${formatNumber(currentUser.totalXP)}
                        </strong>
                        <span>Period XP</span>
                    </div>

                    <div>
                        <strong>
                            ${formatNumber(currentUser.totalSolved)}
                        </strong>
                        <span>Solved</span>
                    </div>

                    <div>
                        <strong>
                            ${formatNumber(currentUser.totalAttempts)}
                        </strong>
                        <span>Attempts</span>
                    </div>

                </div>
            `;
    }


    /*
    =====================================================
    SUMMARY
    =====================================================
    */

    function renderSummary() {

        setText(
            "leaderboard-page-number",
            `Page ${currentPage}`
        );


        const title =
            document.querySelector(
                ".leaderboard-toolbar-title"
            );


        if (
            title
        ) {

            title.textContent =
                (
                    currentPeriod ===
                    "all"
                        ?
                        "ALL-TIME XP"
                        :
                        currentPeriod ===
                        "week"
                            ?
                            "THIS WEEK"
                            :
                            "THIS MONTH"
                );
        }


        if (
            currentRows.length ===
            0
        ) {

            setText(
                "leaderboard-range",
                "No rankings"
            );


            return;
        }


        const first =
            currentRows[0].rank;


        const last =
            currentRows[
                currentRows.length
                -
                1
            ].rank;


        setText(
            "leaderboard-range",
            `Ranks ${first}–${last}`
        );
    }


    /*
    =====================================================
    PAGINATION
    =====================================================
    */

    async function nextPage() {

        if (
            currentRows.length <
            PAGE_SIZE
        ) {

            return;
        }


        currentPage++;


        await refresh();


        /*
        Empty page means we stepped too far.
        */

        if (
            currentRows.length ===
            0
        ) {

            currentPage--;


            await refresh();
        }
    }


    async function previousPage() {

        if (
            currentPage <=
            1
        ) {

            return;
        }


        currentPage--;


        await refresh();
    }


    function renderPageControls() {

        const previous =
            document.getElementById(
                "leaderboard-previous"
            );


        const next =
            document.getElementById(
                "leaderboard-next"
            );


        if (
            previous
        ) {

            previous.disabled =
                currentPage <=
                1;
        }


        if (
            next
        ) {

            next.disabled =
                currentRows.length <
                PAGE_SIZE;
        }
    }


    /*
    =====================================================
    PERIOD BUTTONS
    =====================================================
    */

    function updatePeriodButtons() {

        document
            .querySelectorAll(
                ".leaderboard-period-button"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.period ===
                            currentPeriod
                    );

                }
            );
    }


    /*
    =====================================================
    LOADING / ERROR
    =====================================================
    */

    function setLoading(
        state
    ) {

        const refreshButton =
            document.getElementById(
                "leaderboard-refresh"
            );


        if (
            refreshButton
        ) {

            refreshButton.disabled =
                state;


            refreshButton.textContent =
                state
                    ?
                    "Loading..."
                    :
                    "Refresh";
        }


        setText(
            "leaderboard-status",
            state
                ?
                "Loading global rankings..."
                :
                ""
        );
    }


    function renderError(
        error
    ) {

        console.error(
            "Leaderboard UI error:",
            error
        );


        const body =
            document.getElementById(
                "leaderboard-body"
            );


        if (
            body
        ) {

            body.innerHTML =
                `
                    <div class="leaderboard-empty">
                        Could not load leaderboard.
                    </div>
                `;
        }


        setText(
            "leaderboard-status",
            "Leaderboard unavailable."
        );
    }


    /*
    =====================================================
    LABELS
    =====================================================
    */

    function periodLabel() {

        if (
            currentPeriod ===
            "week"
        ) {

            return "weekly";
        }


        if (
            currentPeriod ===
            "month"
        ) {

            return "monthly";
        }


        return "global";
    }


    /*
    =====================================================
    STYLES
    =====================================================
    */

    function installFilterStyles() {

        if (
            document.getElementById(
                "leaderboard-filter-styles"
            )
        ) {

            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "leaderboard-filter-styles";


        style.textContent =
            `

            .leaderboard-period-controls {

                display: flex;

                gap: 6px;

                flex-wrap: wrap;

                justify-content: flex-end;

            }


            .leaderboard-period-button {

                padding: 8px 10px;

                border:
                    1px solid
                    var(--border);

                border-radius: 8px;

                background:
                    var(--background);

                color:
                    var(--muted);

                font: inherit;

                font-size: 8px;

                font-weight: 900;

                cursor: pointer;

            }


            .leaderboard-period-button:hover {

                border-color:
                    var(--primary);

                color:
                    var(--text);

            }


            .leaderboard-period-button.active {

                border-color:
                    var(--primary);

                background:
                    var(--primary);

                color: white;

            }


            @media (max-width: 760px) {

                .leaderboard-period-controls {

                    width: 100%;

                    justify-content: flex-start;

                }

            }

            `;


        document.head.appendChild(
            style
        );
    }


    /*
    =====================================================
    HELPERS
    =====================================================
    */

    function formatRank(
        rank
    ) {

        if (
            rank ===
            1
        ) {

            return "🥇 #1";
        }


        if (
            rank ===
            2
        ) {

            return "🥈 #2";
        }


        if (
            rank ===
            3
        ) {

            return "🥉 #3";
        }


        return `#${formatNumber(rank)}`;
    }


    function formatNumber(
        value
    ) {

        return Number(
            value
            ||
            0
        )
        .toLocaleString();
    }


    function escapeHTML(
        value
    ) {

        return String(
            value
            ||
            ""
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
    }


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

        initialize,

        refresh,

        changePeriod

    };


})();


document.addEventListener(
    "DOMContentLoaded",
    () => {

        LeaderboardUI
            .initialize();

    }
);