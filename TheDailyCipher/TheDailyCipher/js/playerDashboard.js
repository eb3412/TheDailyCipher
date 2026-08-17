/*
=========================================================
THE DAILY CIPHER
PLAYER DASHBOARD v1.1
=========================================================
*/


window.PlayerDashboard = (() => {


    const COLLAPSE_KEYS = {

        mastery:
            "tdc_dashboard_mastery_collapsed",

        activity:
            "tdc_dashboard_activity_collapsed"

    };


    /*
    =====================================================
    INITIALIZE
    =====================================================
    */

    function initialize() {

        if (
            typeof AchievementEngine !==
            "undefined"
        ) {

            AchievementEngine
                .syncUnlocks();
        }


        setupCollapsibleSections();


        renderProgression();

        renderActivityStats();

        renderStreaks();

        renderMasteryInsights();

        renderRecommendation();

        renderAchievements();

        renderMasteryRanking();

renderRecentActivity();

renderGlobalRank();


window.addEventListener(
    "tdc-leaderboard-update",
    () => {

        renderGlobalRank();

    }
);

    }


    /*
    =====================================================
    PROGRESSION
    =====================================================
    */

    function renderProgression() {

        if (
            typeof ProgressionEngine ===
            "undefined"
        ) {

            return;
        }


        const progress =
            ProgressionEngine
                .getProgressSummary();


        setText(
            "dashboard-level",
            progress.level
        );


        setText(
            "dashboard-level-title",
            progress.title
        );


        setText(
            "dashboard-total-xp",
            progress.totalXP
                .toLocaleString()
        );


        setText(
            "dashboard-xp-current",
            (
                `${progress.xpIntoLevel.toLocaleString()}`
                +
                ` / `
                +
                `${progress.xpNeededForLevel.toLocaleString()} XP`
            )
        );


        setText(
            "dashboard-xp-remaining",
            (
                `${progress.xpRemaining.toLocaleString()} XP`
                +
                ` to Level `
                +
                `${progress.level + 1}`
            )
        );


        const fill =
            document.getElementById(
                "dashboard-xp-fill"
            );


        if (
            fill
        ) {

            fill.style.width =
                `${progress.progressPercent}%`;
        }
    }


    /*
    =====================================================
    ACTIVITY STATS
    =====================================================
    */

    function renderActivityStats() {

        if (
            typeof getActivityHistory !==
            "function"
        ) {

            return;
        }


        const history =
            getActivityHistory();


        const solved =
            history.filter(
                activity =>
                    activity.solved ===
                    true
            );


        const totalAttempts =
            history.length;


        const totalSolved =
            solved.length;


        const solveRate =
            totalAttempts ===
            0
                ?
                0
                :
                Math.round(
                    totalSolved
                    /
                    totalAttempts
                    *
                    100
                );


        const timedSolves =
            solved.filter(
                activity =>
                    Number(
                        activity.timeSeconds
                    )
                    >
                    0
            );


        const averageTime =
            timedSolves.length ===
            0
                ?
                0
                :
                Math.round(
                    timedSolves.reduce(
                        (
                            total,
                            activity
                        ) =>
                            total
                            +
                            Number(
                                activity.timeSeconds
                            ),
                        0
                    )
                    /
                    timedSolves.length
                );


        const hardSolves =
            solved.filter(
                activity =>
                    activity.difficulty ===
                    "Hard"
            ).length;


        const activeDates =
            new Set(
                solved
                    .map(
                        activity =>
                            activity.date
                            ||
                            (
                                activity.timestamp
                                    ?
                                    String(
                                        activity.timestamp
                                    )
                                    .slice(
                                        0,
                                        10
                                    )
                                    :
                                    null
                            )
                    )
                    .filter(
                        Boolean
                    )
            );


        const today =
            getLocalDateKey();


        const todaySolves =
            solved.filter(
                activity => {

                    const date =
                        activity.date
                        ||
                        (
                            activity.timestamp
                                ?
                                String(
                                    activity.timestamp
                                )
                                .slice(
                                    0,
                                    10
                                )
                                :
                                null
                        );


                    return date ===
                        today;

                }
            ).length;


        setText(
            "dashboard-total-solves",
            totalSolved
                .toLocaleString()
        );


        setText(
            "dashboard-solve-detail",
            (
                `${totalAttempts.toLocaleString()} `
                +
                (
                    totalAttempts ===
                    1
                        ?
                        "attempt"
                        :
                        "attempts"
                )
            )
        );


        setText(
            "dashboard-solve-rate",
            `${solveRate}%`
        );


        setText(
            "dashboard-average-time",
            formatTime(
                averageTime
            )
        );


        setText(
            "dashboard-hard-solves",
            hardSolves
        );


        setText(
            "dashboard-active-days",
            activeDates.size
        );


        setText(
            "dashboard-today-solves",
            todaySolves
        );
    }


    /*
    =====================================================
    STREAKS
    =====================================================
    */

    function renderStreaks() {

        if (
            typeof StreakEngine ===
            "undefined"
        ) {

            return;
        }


        const daily =
            StreakEngine
                .getDailyStreak();


        const activity =
            StreakEngine
                .getActivityStreak();


        setText(
            "dashboard-daily-streak",
            daily.current
        );


        setText(
            "dashboard-daily-best",
            `Best ${daily.longest} days`
        );


        setText(
            "dashboard-activity-streak",
            activity.current
        );


        setText(
            "dashboard-activity-best",
            `Best ${activity.longest} days`
        );
    }


    /*
    =====================================================
    MASTERY INSIGHTS
    =====================================================
    */

    function renderMasteryInsights() {

        if (
            typeof MasteryEngine ===
            "undefined"
        ) {

            return;
        }


        const overall =
            MasteryEngine
                .getOverallMastery();


        const strongest =
            MasteryEngine
                .getStrongestCipher();


        const weakest =
            MasteryEngine
                .getWeakestCipher();


        setText(
            "dashboard-overall-mastery",
            `${overall.mastery} • ${overall.rank}`
        );


        setText(
            "dashboard-mastery-coverage",
            (
                `${overall.ciphersPracticed}`
                +
                ` of `
                +
                `${overall.totalCiphers}`
                +
                ` ciphers practiced`
            )
        );


        if (
            strongest
        ) {

            setText(
                "dashboard-strongest",
                strongest.name
            );


            setText(
                "dashboard-strongest-detail",
                (
                    `${strongest.mastery} mastery`
                    +
                    ` • `
                    +
                    `${strongest.solveRate}% solve rate`
                )
            );
        }


        if (
            weakest
        ) {

            setText(
                "dashboard-weakest",
                weakest.name
            );


            setText(
                "dashboard-weakest-detail",
                (
                    `${weakest.mastery} mastery`
                    +
                    ` • `
                    +
                    `${weakest.solveRate}% solve rate`
                )
            );
        }
    }


    /*
    =====================================================
    RECOMMENDATION
    =====================================================
    */

    function renderRecommendation() {

        if (
            typeof MasteryEngine ===
            "undefined"
        ) {

            return;
        }


        const recommendation =
            MasteryEngine
                .getRecommendedCipher();


        if (
            !recommendation
        ) {

            return;
        }


        setText(
            "dashboard-recommendation-name",
            recommendation.name
        );


        setText(
            "dashboard-recommendation-reason",
            recommendation
                .recommendationReason
        );


        const link =
            document.getElementById(
                "dashboard-recommendation-link"
            );


        if (
            link
        ) {

            link.href =
                (
                    "../practice/?cipher="
                    +
                    encodeURIComponent(
                        recommendation.cipher
                    )
                );
        }
    }


    /*
    =====================================================
    ACHIEVEMENTS
    =====================================================
    */

    function renderAchievements() {

        if (
            typeof AchievementEngine ===
            "undefined"
        ) {

            return;
        }


        const summary =
            AchievementEngine
                .getSummary();


        setText(
            "dashboard-achievement-unlocked",
            summary.unlocked
        );


        setText(
            "dashboard-achievement-total",
            `/ ${summary.total} unlocked`
        );


        const fill =
            document.getElementById(
                "dashboard-achievement-fill"
            );


        if (
            fill
        ) {

            fill.style.width =
                `${summary.completionPercent}%`;
        }


        renderNearestAchievements();

        renderRecentAchievements();
    }


    /*
    =====================================================
    NEAREST ACHIEVEMENTS
    =====================================================
    */

    function renderNearestAchievements() {

        const container =
            document.getElementById(
                "dashboard-nearest-achievements"
            );


        if (
            !container
        ) {

            return;
        }


        const nearest =
            AchievementEngine
                .getNearestLocked(
                    3
                );


        container.innerHTML =
            "";


        if (
            nearest.length ===
            0
        ) {

            container.innerHTML =
                `

                <div class="dashboard-empty">
                    Every achievement is unlocked.
                </div>

                `;


            return;
        }


        nearest.forEach(
            achievement => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "dashboard-nearest-achievement";


                const name =
                    document.createElement(
                        "div"
                    );


                name.className =
                    "dashboard-nearest-name";


                name.textContent =
                    achievement.name;


                const progress =
                    document.createElement(
                        "div"
                    );


                progress.className =
                    "dashboard-nearest-progress";


                progress.textContent =
                    (
                        `${formatNumber(
                            achievement.progress
                        )}`
                        +
                        ` / `
                        +
                        `${formatNumber(
                            achievement.target
                        )}`
                        +
                        ` • `
                        +
                        `${achievement.progressPercent}%`
                    );


                card.appendChild(
                    name
                );


                card.appendChild(
                    progress
                );


                container.appendChild(
                    card
                );

            }
        );
    }


    /*
    =====================================================
    RECENT ACHIEVEMENTS
    =====================================================
    */

    function renderRecentAchievements() {

        const container =
            document.getElementById(
                "dashboard-recent-achievements"
            );


        if (
            !container
        ) {

            return;
        }


        const recent =
            AchievementEngine
                .getRecentlyUnlocked(
                    3
                );


        container.innerHTML =
            "";


        if (
            recent.length ===
            0
        ) {

            container.innerHTML =
                `

                <div class="dashboard-empty">
                    No achievements unlocked yet.
                </div>

                `;


            return;
        }


        recent.forEach(
            achievement => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "dashboard-nearest-achievement";


                const name =
                    document.createElement(
                        "div"
                    );


                name.className =
                    "dashboard-nearest-name";


                name.textContent =
                    `✓ ${achievement.name}`;


                const detail =
                    document.createElement(
                        "div"
                    );


                detail.className =
                    "dashboard-nearest-progress";


                detail.textContent =
                    (
                        `${capitalize(
                            achievement.tier
                        )}`
                        +
                        ` • `
                        +
                        formatDate(
                            achievement.unlockedAt
                        )
                    );


                card.appendChild(
                    name
                );


                card.appendChild(
                    detail
                );


                container.appendChild(
                    card
                );

            }
        );
    }


    /*
    =====================================================
    MASTERY RANKING
    =====================================================
    */

    function renderMasteryRanking() {

        const container =
            document.getElementById(
                "dashboard-mastery-list"
            );


        if (
            !container
            ||
            typeof MasteryEngine ===
            "undefined"
        ) {

            return;
        }


        const ranking =
            MasteryEngine
                .getMasteryRanking();


        container.innerHTML =
            "";


        ranking.forEach(
            item => {

                container.appendChild(
                    createMasteryRow(
                        item
                    )
                );

            }
        );
    }


    function createMasteryRow(
        item
    ) {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "dashboard-mastery-row";


        const identity =
            document.createElement(
                "div"
            );


        const name =
            document.createElement(
                "div"
            );


        name.className =
            "dashboard-mastery-name";


        name.textContent =
            item.name;


        const rank =
            document.createElement(
                "div"
            );


        rank.className =
            "dashboard-mastery-rank";


        rank.textContent =
            item.attempts >
            0
                ?
                (
                    `${item.rank}`
                    +
                    ` • `
                    +
                    `${item.solved}/${item.attempts} solved`
                )
                :
                "Not practiced";


        identity.appendChild(
            name
        );


        identity.appendChild(
            rank
        );


        const track =
            document.createElement(
                "div"
            );


        track.className =
            "dashboard-mastery-track";


        const fill =
            document.createElement(
                "div"
            );


        fill.className =
            "dashboard-mastery-fill";


        fill.style.width =
            `${item.mastery}%`;


        track.appendChild(
            fill
        );


        const score =
            document.createElement(
                "div"
            );


        score.className =
            "dashboard-mastery-score";


        score.textContent =
            item.mastery;


        row.appendChild(
            identity
        );


        row.appendChild(
            track
        );


        row.appendChild(
            score
        );


        return row;
    }


    /*
    =====================================================
    RECENT ACTIVITY
    =====================================================
    */

    function renderRecentActivity() {

        const container =
            document.getElementById(
                "dashboard-activity-list"
            );


        if (
            !container
            ||
            typeof getActivityHistory !==
            "function"
        ) {

            return;
        }


        const activity =
            getActivityHistory({

                limit:
                    10

            });


        container.innerHTML =
            "";


        if (
            activity.length ===
            0
        ) {

            container.innerHTML =
                `

                <div class="dashboard-empty">
                    No activity yet.
                </div>

                `;


            return;
        }


        activity.forEach(
            record => {

                container.appendChild(
                    createActivityRow(
                        record
                    )
                );

            }
        );
    }


    function createActivityRow(
        record
    ) {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "dashboard-activity-row";


        const identity =
            document.createElement(
                "div"
            );


        const name =
            document.createElement(
                "div"
            );


        name.className =
            "dashboard-activity-name";


        name.textContent =
            getCipherDisplayName(
                record.cipher
            );


        const meta =
            document.createElement(
                "div"
            );


        meta.className =
            "dashboard-activity-meta";


        meta.textContent =
            (
                `${capitalize(
                    record.source
                )}`
                +
                ` • `
                +
                `${record.difficulty}`
                +
                ` • `
                +
                `${formatDate(
                    record.timestamp
                    ||
                    record.date
                )}`
            );


        identity.appendChild(
            name
        );


        identity.appendChild(
            meta
        );


        const score =
            document.createElement(
                "div"
            );


        score.className =
            "dashboard-activity-stat";


        score.textContent =
            `${record.score || 0} pts`;


        const time =
            document.createElement(
                "div"
            );


        time.className =
            "dashboard-activity-stat";


        time.textContent =
            formatTime(
                record.timeSeconds
            );


        const result =
            document.createElement(
                "div"
            );


        result.className =
            (
                "dashboard-activity-result "
                +
                (
                    record.solved
                        ?
                        "dashboard-success"
                        :
                        "dashboard-failure"
                )
            );


        result.textContent =
            record.solved
                ?
                "SOLVED"
                :
                "FAILED";


        row.appendChild(
            identity
        );


        row.appendChild(
            score
        );


        row.appendChild(
            time
        );


        row.appendChild(
            result
        );


        return row;
    }

    /*
=========================================================
GLOBAL LEADERBOARD RANK
=========================================================
*/

async function renderGlobalRank() {

    installGlobalRankCard();


    const rankValue =
        document.getElementById(
            "dashboard-global-rank"
        );


    const username =
        document.getElementById(
            "dashboard-global-username"
        );


    const detail =
        document.getElementById(
            "dashboard-global-detail"
        );


    if (
        !rankValue
        ||
        !username
        ||
        !detail
    ) {

        return;
    }


    /*
    =====================================================
    LEADERBOARD ENGINE AVAILABLE?
    =====================================================
    */

    if (
        typeof LeaderboardEngine ===
        "undefined"
    ) {

        rankValue.textContent =
            "—";


        username.textContent =
            "Leaderboard unavailable";


        detail.textContent =
            "Could not load global ranking.";


        return;
    }


    rankValue.textContent =
        "…";


    username.textContent =
        "Loading rank";


    detail.textContent =
        "Checking the global leaderboard.";


    try {

        /*
        Determine whether this is a guest first.
        */

        const {
            data:
                sessionData
        } =
            await supabaseClient
                .auth
                .getSession();


        const signedIn =
            Boolean(
                sessionData
                    ?.session
                    ?.user
            );


        if (
            !signedIn
        ) {

            rankValue.textContent =
                "—";


            username.textContent =
                "Guest Player";


            detail.textContent =
                "Sign in and choose a username to receive a global rank.";


            return;
        }


        /*
        Fetch trusted all-time rank.
        */

        const result =
            await LeaderboardEngine
                .fetchMyRank(
                    "all"
                );


        if (
            !result.success
        ) {

            throw (
                result.error
                ||
                new Error(
                    "Could not load global rank."
                )
            );
        }


        const player =
            result.data;


        /*
        Signed in but not leaderboard eligible.
        Usually means no username yet.
        */

        if (
            !player
        ) {

            rankValue.textContent =
                "—";


            username.textContent =
                "Not Ranked Yet";


            detail.textContent =
                "Choose a public username from your Account page to join the leaderboard.";


            return;
        }


        rankValue.textContent =
            `#${formatNumber(
                player.rank
            )}`;


        username.textContent =
            `@${player.username}`;


        detail.textContent =
            (
                `${formatNumber(
                    player.totalXP
                )} leaderboard XP`
                +
                ` • `
                +
                `${formatNumber(
                    player.totalSolved
                )} solved`
            );


    } catch (
        error
    ) {

        console.error(
            "Dashboard global rank error:",
            error
        );


        rankValue.textContent =
            "—";


        username.textContent =
            "Rank unavailable";


        detail.textContent =
            "The leaderboard could not be reached.";
    }
}


/*
=========================================================
INSTALL GLOBAL RANK CARD
=========================================================
*/

function installGlobalRankCard() {

    if (
        document.getElementById(
            "dashboard-global-rank-card"
        )
    ) {

        return;
    }


    const statGrid =
        document.querySelector(
            ".dashboard-stat-grid"
        );


    if (
        !statGrid
    ) {

        return;
    }


    /*
    Install CSS once.
    */

    if (
        !document.getElementById(
            "dashboard-global-rank-styles"
        )
    ) {

        const style =
            document.createElement(
                "style"
            );


        style.id =
            "dashboard-global-rank-styles";


        style.textContent =
            `

            .dashboard-global-rank-card {

                margin-bottom: 16px;

                padding: 18px;

                border:
                    1px solid
                    rgba(
                        99,
                        102,
                        241,
                        0.4
                    );

                border-radius: 14px;

                background:
                    rgba(
                        99,
                        102,
                        241,
                        0.07
                    );

            }


            .dashboard-global-rank-top {

                display: flex;

                align-items: center;

                justify-content: space-between;

                gap: 20px;

            }


            .dashboard-global-rank-label {

                color: var(--muted);

                font-size: 8px;

                font-weight: 900;

                letter-spacing: 1.1px;

            }


            .dashboard-global-rank-value {

                margin-top: 5px;

                font-family: monospace;

                font-size: 30px;

                font-weight: 900;

                color: var(--primary-hover);

            }


            .dashboard-global-rank-user {

                margin-top: 4px;

                font-size: 13px;

                font-weight: 900;

            }


            .dashboard-global-rank-detail {

                margin-top: 4px;

                color: var(--muted);

                font-size: 9px;

            }


            .dashboard-global-rank-link {

                display: inline-flex;

                align-items: center;

                justify-content: center;

                padding: 10px 13px;

                border:
                    1px solid
                    var(--primary);

                border-radius: 9px;

                background: var(--primary);

                color: white;

                text-decoration: none;

                font-size: 9px;

                font-weight: 900;

            }


            .dashboard-global-rank-link:hover {

                background:
                    var(--primary-hover);

            }


            @media (max-width: 600px) {

                .dashboard-global-rank-top {

                    align-items: flex-start;

                    flex-direction: column;

                }

            }

            `;


        document.head.appendChild(
            style
        );
    }


    /*
    Build card.
    */

    const card =
        document.createElement(
            "section"
        );


    card.id =
        "dashboard-global-rank-card";


    card.className =
        "dashboard-global-rank-card";


    card.innerHTML =
        `

        <div class="dashboard-global-rank-top">

            <div>

                <div class="dashboard-global-rank-label">
                    GLOBAL LEADERBOARD
                </div>

                <div
                    id="dashboard-global-rank"
                    class="dashboard-global-rank-value"
                >
                    …
                </div>

                <div
                    id="dashboard-global-username"
                    class="dashboard-global-rank-user"
                >
                    Loading rank
                </div>

                <div
                    id="dashboard-global-detail"
                    class="dashboard-global-rank-detail"
                >
                    Checking the global leaderboard.
                </div>

            </div>


            <a
                href="../leaderboard/index.html"
                class="dashboard-global-rank-link"
            >
                View Leaderboard →
            </a>

        </div>

        `;


    /*
    Place it directly before the normal stat grid.
    */

    statGrid.parentNode.insertBefore(
        card,
        statGrid
    );
}

    /*
    =====================================================
    COLLAPSIBLE SECTIONS
    =====================================================
    */

    function setupCollapsibleSections() {

        setupCollapse({

            buttonId:
                "dashboard-mastery-collapse",

            panelId:
                "dashboard-mastery-panel",

            storageKey:
                COLLAPSE_KEYS.mastery

        });


        setupCollapse({

            buttonId:
                "dashboard-activity-collapse",

            panelId:
                "dashboard-activity-panel",

            storageKey:
                COLLAPSE_KEYS.activity

        });
    }


    function setupCollapse({
        buttonId,
        panelId,
        storageKey
    }) {

        const button =
            document.getElementById(
                buttonId
            );


        const panel =
            document.getElementById(
                panelId
            );


        if (
            !button
            ||
            !panel
        ) {

            return;
        }


        let collapsed =
            false;


        try {

            collapsed =
                localStorage.getItem(
                    storageKey
                )
                ===
                "true";

        } catch (
            error
        ) {

            collapsed =
                false;
        }


        applyCollapseState(
            button,
            panel,
            collapsed
        );


        button.addEventListener(
            "click",
            () => {

                collapsed =
                    !collapsed;


                applyCollapseState(
                    button,
                    panel,
                    collapsed
                );


                try {

                    localStorage.setItem(
                        storageKey,
                        collapsed
                            ?
                            "true"
                            :
                            "false"
                    );

                } catch (
                    error
                ) {

                }

            }
        );
    }


    function applyCollapseState(
        button,
        panel,
        collapsed
    ) {

        panel.classList.toggle(
            "dashboard-collapsed",
            collapsed
        );


        button.textContent =
            collapsed
                ?
                "Expand"
                :
                "Collapse";


        button.setAttribute(
            "aria-expanded",
            collapsed
                ?
                "false"
                :
                "true"
        );
    }


    /*
    =====================================================
    HELPERS
    =====================================================
    */

    function getCipherDisplayName(
        cipher
    ) {

        if (
            typeof MasteryEngine !==
            "undefined"
        ) {

            return MasteryEngine
                .getCipherName(
                    cipher
                );
        }


        return capitalize(
            cipher
        );
    }


    function getLocalDateKey() {

        const now =
            new Date();


        const year =
            now.getFullYear();


        const month =
            String(
                now.getMonth()
                +
                1
            )
            .padStart(
                2,
                "0"
            );


        const day =
            String(
                now.getDate()
            )
            .padStart(
                2,
                "0"
            );


        return `${year}-${month}-${day}`;
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


    function capitalize(
        value
    ) {

        const string =
            String(
                value
                ||
                ""
            );


        return (
            string.charAt(
                0
            )
            .toUpperCase()
            +
            string.slice(
                1
            )
        );
    }


    function formatNumber(
        value
    ) {

        const number =
            Number(
                value
            )
            ||
            0;


        return Number.isInteger(
            number
        )
            ?
            number.toLocaleString()
            :
            number.toFixed(
                1
            );
    }


    function formatTime(
        seconds
    ) {

        const total =
            Math.max(
                0,
                Math.round(
                    Number(
                        seconds
                    )
                    ||
                    0
                )
            );


        if (
            total <
            60
        ) {

            return `${total}s`;
        }


        const minutes =
            Math.floor(
                total
                /
                60
            );


        const remaining =
            total
            %
            60;


        return (
            `${minutes}:`
            +
            String(
                remaining
            )
            .padStart(
                2,
                "0"
            )
        );
    }


    function formatDate(
        value
    ) {

        if (
            !value
        ) {

            return "";
        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                value
            );
        }


        return date
            .toLocaleDateString(
                undefined,
                {

                    month:
                        "short",

                    day:
                        "numeric",

                    year:
                        "numeric"

                }
            );
    }


    return {

        initialize

    };


})();


document.addEventListener(
    "DOMContentLoaded",
    () => {

        PlayerDashboard
            .initialize();

    }
);