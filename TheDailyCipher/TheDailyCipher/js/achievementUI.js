/*
=========================================================
THE DAILY CIPHER
ACHIEVEMENT UI v1.0
=========================================================

Responsibilities:

- Render achievement collection
- Render achievement completion summary
- Filter achievements
- Collapse / expand achievement panel
- Show live achievement unlock notifications
=========================================================
*/


window.AchievementUI = (() => {


    const COLLAPSE_STORAGE_KEY =
        "tdc_achievements_collapsed";


    let currentFilter =
        "all";


    let toastQueue =
        [];


    let toastRunning =
        false;


    /*
    =====================================================
    INITIALIZE
    =====================================================
    */

    function initialize() {

        if (
            typeof AchievementEngine ===
            "undefined"
        ) {

            console.warn(
                "AchievementUI could not find AchievementEngine."
            );


            return;
        }


        /*
        Record any achievements already earned from
        historical activity.

        We intentionally do NOT show old unlock toasts
        here. Toasts are only shown for new achievements
        earned during the current session.
        */

        AchievementEngine
            .syncUnlocks();


        setupCollapse();

        setupFilters();

        restoreCollapseState();

        update();
    }


    /*
    =====================================================
    UPDATE
    =====================================================
    */

    function update() {

        if (
            typeof AchievementEngine ===
            "undefined"
        ) {

            return;
        }


        renderSummary();

        renderAchievements();
    }


    /*
    =====================================================
    SYNC + NOTIFY
    =====================================================

    Call this immediately after a completed puzzle has
    been written to activity history.
    =====================================================
    */

    function syncAndNotify() {

        if (
            typeof AchievementEngine ===
            "undefined"
        ) {

            return [];
        }


        const newlyUnlocked =
            AchievementEngine
                .syncUnlocks();


        update();


        if (
            newlyUnlocked.length >
            0
        ) {

            newlyUnlocked.forEach(
                achievement => {

                    queueToast(
                        achievement
                    );

                }
            );
        }


        return newlyUnlocked;
    }


    /*
    =====================================================
    SUMMARY
    =====================================================
    */

    function renderSummary() {

        const summary =
            AchievementEngine
                .getSummary();


        setText(
            "achievement-total-number",
            `${summary.unlocked} / ${summary.total}`
        );


        setText(
            "achievement-overall-count",
            `${summary.unlocked} of ${summary.total} unlocked`
        );


        setText(
            "achievement-overall-percent",
            `${summary.completionPercent}%`
        );


        setText(
            "achievement-bronze",
            summary.byTier.bronze
        );


        setText(
            "achievement-silver",
            summary.byTier.silver
        );


        setText(
            "achievement-gold",
            summary.byTier.gold
        );


        setText(
            "achievement-platinum",
            summary.byTier.platinum
        );


        const fill =
            document.getElementById(
                "achievement-overall-fill"
            );


        if (
            fill
        ) {

            fill.style.width =
                `${summary.completionPercent}%`;
        }
    }


    /*
    =====================================================
    FILTERS
    =====================================================
    */

    function setupFilters() {

        document
            .querySelectorAll(
                "[data-achievement-filter]"
            )
            .forEach(
                button => {

                    if (
                        button.dataset.bound ===
                        "true"
                    ) {

                        return;
                    }


                    button.dataset.bound =
                        "true";


                    button.addEventListener(
                        "click",
                        () => {

                            currentFilter =
                                button.dataset
                                    .achievementFilter
                                ||
                                "all";


                            updateFilterButtons();

                            renderAchievements();

                        }
                    );

                }
            );
    }


    function updateFilterButtons() {

        document
            .querySelectorAll(
                "[data-achievement-filter]"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset
                            .achievementFilter
                        ===
                        currentFilter
                    );

                }
            );
    }


    function applyFilter(
        achievements
    ) {

        switch (
            currentFilter
        ) {

            case "unlocked":

                return achievements.filter(
                    achievement =>
                        achievement.unlocked
                );


            case "locked":

                return achievements.filter(
                    achievement =>
                        !achievement.unlocked
                );


            case "solving":

            case "mastery":

            case "streak":

                return achievements.filter(
                    achievement =>
                        achievement.category ===
                        currentFilter
                );


            default:

                return achievements;
        }
    }


    /*
    =====================================================
    RENDER ACHIEVEMENTS
    =====================================================
    */

    function renderAchievements() {

        const container =
            document.getElementById(
                "achievement-grid"
            );


        if (
            !container
        ) {

            return;
        }


        const achievements =
            applyFilter(
                AchievementEngine
                    .getAllAchievements()
            );


        container.innerHTML =
            "";


        if (
            achievements.length ===
            0
        ) {

            container.innerHTML =
                `

                <div class="achievement-empty">
                    No achievements match this filter.
                </div>

                `;


            return;
        }


        const sorted =
            [
                ...achievements
            ]
            .sort(
                (
                    a,
                    b
                ) => {

                    /*
                    Unlocked achievements first.
                    */

                    if (
                        a.unlocked !==
                        b.unlocked
                    ) {

                        return a.unlocked
                            ?
                            -1
                            :
                            1;
                    }


                    /*
                    Then closest locked achievements.
                    */

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


                    return a.name
                        .localeCompare(
                            b.name
                        );

                }
            );


        sorted.forEach(
            achievement => {

                container.appendChild(
                    createAchievementCard(
                        achievement
                    )
                );

            }
        );
    }


    /*
    =====================================================
    CARD
    =====================================================
    */

    function createAchievementCard(
        achievement
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            `achievement-card ${
                achievement.unlocked
                    ?
                    "unlocked"
                    :
                    "locked"
            }`;


        /*
        Top.
        */

        const top =
            document.createElement(
                "div"
            );


        top.className =
            "achievement-card-top";


        const identity =
            document.createElement(
                "div"
            );


        const name =
            document.createElement(
                "div"
            );


        name.className =
            "achievement-name";


        name.textContent =
            achievement.unlocked
                ?
                `✓ ${achievement.name}`
                :
                achievement.name;


        const description =
            document.createElement(
                "div"
            );


        description.className =
            "achievement-description";


        description.textContent =
            achievement.description;


        identity.appendChild(
            name
        );


        identity.appendChild(
            description
        );


        const tier =
            document.createElement(
                "div"
            );


        tier.className =
            (
                "achievement-tier "
                +
                `achievement-tier-${achievement.tier}`
            );


        tier.textContent =
            achievement.tier;


        top.appendChild(
            identity
        );


        top.appendChild(
            tier
        );


        card.appendChild(
            top
        );


        /*
        Progress.
        */

        const track =
            document.createElement(
                "div"
            );


        track.className =
            "achievement-progress-track";


        const fill =
            document.createElement(
                "div"
            );


        fill.className =
            "achievement-progress-fill";


        fill.style.width =
            `${achievement.progressPercent}%`;


        track.appendChild(
            fill
        );


        card.appendChild(
            track
        );


        /*
        Progress text.
        */

        const detail =
            document.createElement(
                "div"
            );


        detail.className =
            "achievement-progress-detail";


        const count =
            document.createElement(
                "span"
            );


        count.textContent =
            `${formatProgress(
                achievement.progress
            )} / ${formatProgress(
                achievement.target
            )}`;


        const percent =
            document.createElement(
                "span"
            );


        percent.textContent =
            `${achievement.progressPercent}%`;


        detail.appendChild(
            count
        );


        detail.appendChild(
            percent
        );


        card.appendChild(
            detail
        );


        /*
        Unlock date.
        */

        if (
            achievement.unlocked
            &&
            achievement.unlockedAt
        ) {

            const date =
                document.createElement(
                    "div"
                );


            date.className =
                "achievement-unlocked-date";


            date.textContent =
                `Unlocked ${formatDate(
                    achievement.unlockedAt
                )}`;


            card.appendChild(
                date
            );
        }


        return card;
    }


    /*
    =====================================================
    COLLAPSE
    =====================================================
    */

    function setupCollapse() {

        const button =
            document.getElementById(
                "achievement-collapse-button"
            );


        if (
            !button
            ||
            button.dataset.bound ===
            "true"
        ) {

            return;
        }


        button.dataset.bound =
            "true";


        button.addEventListener(
            "click",
            () => {

                const panel =
                    document.getElementById(
                        "achievement-panel"
                    );


                if (
                    !panel
                ) {

                    return;
                }


                const collapsed =
                    !panel.classList.contains(
                        "collapsed"
                    );


                setCollapsed(
                    collapsed
                );


                try {

                    localStorage.setItem(
                        COLLAPSE_STORAGE_KEY,
                        collapsed
                            ?
                            "true"
                            :
                            "false"
                    );

                } catch (
                    error
                ) {

                    /*
                    Storage unavailable.
                    */
                }

            }
        );
    }


    function restoreCollapseState() {

        let collapsed =
            false;


        try {

            collapsed =
                localStorage.getItem(
                    COLLAPSE_STORAGE_KEY
                )
                ===
                "true";

        } catch (
            error
        ) {

            collapsed =
                false;
        }


        setCollapsed(
            collapsed
        );
    }


    function setCollapsed(
        collapsed
    ) {

        const panel =
            document.getElementById(
                "achievement-panel"
            );


        const button =
            document.getElementById(
                "achievement-collapse-button"
            );


        const text =
            document.getElementById(
                "achievement-collapse-text"
            );


        if (
            !panel
        ) {

            return;
        }


        panel.classList.toggle(
            "collapsed",
            collapsed
        );


        if (
            button
        ) {

            button.setAttribute(
                "aria-expanded",
                collapsed
                    ?
                    "false"
                    :
                    "true"
            );
        }


        if (
            text
        ) {

            text.textContent =
                collapsed
                    ?
                    "Expand"
                    :
                    "Collapse";
        }
    }


    /*
    =====================================================
    TOAST QUEUE
    =====================================================
    */

    function queueToast(
        achievement
    ) {

        toastQueue.push(
            achievement
        );


        runToastQueue();
    }


    async function runToastQueue() {

        if (
            toastRunning
            ||
            toastQueue.length ===
            0
        ) {

            return;
        }


        toastRunning =
            true;


        while (
            toastQueue.length >
            0
        ) {

            const achievement =
                toastQueue.shift();


            await showToast(
                achievement
            );


            AchievementEngine
                .markAchievementSeen(
                    achievement.id
                );
        }


        toastRunning =
            false;
    }


    /*
    =====================================================
    SHOW TOAST
    =====================================================
    */

    function showToast(
        achievement
    ) {

        return new Promise(
            resolve => {

                const container =
                    document.getElementById(
                        "achievement-toast-container"
                    );


                if (
                    !container
                ) {

                    resolve();

                    return;
                }


                const toast =
                    document.createElement(
                        "div"
                    );


                toast.className =
                    "achievement-toast";


                const eyebrow =
                    document.createElement(
                        "div"
                    );


                eyebrow.className =
                    "achievement-toast-eyebrow";


                eyebrow.textContent =
                    "ACHIEVEMENT UNLOCKED";


                const name =
                    document.createElement(
                        "div"
                    );


                name.className =
                    "achievement-toast-name";


                name.textContent =
                    achievement.name;


                const description =
                    document.createElement(
                        "div"
                    );


                description.className =
                    "achievement-toast-description";


                description.textContent =
                    achievement.description;


                const tier =
                    document.createElement(
                        "div"
                    );


                tier.className =
                    (
                        "achievement-toast-tier "
                        +
                        `achievement-tier-${achievement.tier}`
                    );


                tier.textContent =
                    achievement.tier;


                toast.appendChild(
                    eyebrow
                );


                toast.appendChild(
                    name
                );


                toast.appendChild(
                    description
                );


                toast.appendChild(
                    tier
                );


                container.appendChild(
                    toast
                );


                requestAnimationFrame(
                    () => {

                        requestAnimationFrame(
                            () => {

                                toast.classList.add(
                                    "show"
                                );

                            }
                        );

                    }
                );


                setTimeout(
                    () => {

                        toast.classList.remove(
                            "show"
                        );


                        setTimeout(
                            () => {

                                toast.remove();

                                resolve();

                            },
                            250
                        );

                    },
                    4000
                );

            }
        );
    }


    /*
    =====================================================
    HELPERS
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


    function formatProgress(
        value
    ) {

        const number =
            Number(
                value
            )
            ||
            0;


        if (
            Number.isInteger(
                number
            )
        ) {

            return number
                .toLocaleString();
        }


        return number
            .toFixed(
                1
            );
    }


    function formatDate(
        value
    ) {

        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";
        }


        return date
            .toLocaleDateString(
                undefined,
                {

                    year:
                        "numeric",

                    month:
                        "short",

                    day:
                        "numeric"

                }
            );
    }


    /*
    =====================================================
    PUBLIC API
    =====================================================
    */

    return {

        initialize,

        update,

        syncAndNotify,

        setCollapsed

    };


})();