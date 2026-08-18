/*
=========================================================
THE DAILY CIPHER
MASTERY UI v1.1
=========================================================

Responsibilities:

- Overall mastery
- Strongest cipher
- Weakest practiced cipher
- Recommended practice
- Full mastery list
- Collapse / expand mastery panel
=========================================================
*/


const MasteryUI = (() => {


    const COLLAPSE_STORAGE_KEY =
        "tdc_mastery_collapsed";


    /*
    =====================================================
    INITIALIZE
    =====================================================
    */

    function initialize() {

        setupCollapseButton();

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
            typeof MasteryEngine
            ===
            "undefined"
        ) {

            return;
        }


        renderOverall();

        renderStrongestWeakest();

        renderRecommendation();

        renderMasteryList();
    }


    /*
    =====================================================
    COLLAPSE
    =====================================================
    */

    function setupCollapseButton() {

        const button =
            document.getElementById(
                "mastery-collapse-button"
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
            toggleCollapsed
        );
    }


    function toggleCollapsed() {

        const panel =
            document.getElementById(
                "mastery-panel"
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
            localStorage unavailable.
            Collapse still works for the current page.
            */
        }
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
                "mastery-panel"
            );


        const button =
            document.getElementById(
                "mastery-collapse-button"
            );


        const text =
            document.getElementById(
                "mastery-collapse-text"
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
    OVERALL
    =====================================================
    */

    function renderOverall() {

        const overall =
            MasteryEngine
                .getOverallMastery();


        setText(
            "mastery-overall-score",
            overall.mastery
        );


        setText(
            "mastery-overall-rank",
            overall.rank
                .toUpperCase()
        );


        setText(
            "mastery-coverage",
            `${overall.ciphersPracticed} / ${overall.totalCiphers}`
        );
    }


    /*
    =====================================================
    STRONGEST / WEAKEST
    =====================================================
    */

    function renderStrongestWeakest() {

        const strongest =
            MasteryEngine
                .getStrongestCipher();


        const weakest =
            MasteryEngine
                .getWeakestCipher();


        if (
            strongest
        ) {

            setText(
                "mastery-strongest-name",
                strongest.name
            );


            setText(
                "mastery-strongest-detail",
                `${strongest.mastery} mastery • ${strongest.rank}`
            );

        } else {

            setText(
                "mastery-strongest-name",
                "None yet"
            );


            setText(
                "mastery-strongest-detail",
                "Complete some practice first."
            );
        }


        if (
            weakest
        ) {

            setText(
                "mastery-weakest-name",
                weakest.name
            );


            setText(
                "mastery-weakest-detail",
                `${weakest.mastery} mastery • ${weakest.solveRate}% solve rate`
            );

        } else {

            setText(
                "mastery-weakest-name",
                "None yet"
            );


            setText(
                "mastery-weakest-detail",
                "Complete some practice first."
            );
        }
    }


    /*
    =====================================================
    RECOMMENDATION
    =====================================================
    */

    function renderRecommendation() {

        const recommendation =
            MasteryEngine
                .getRecommendedCipher();


        const container =
            document.getElementById(
                "mastery-recommendation"
            );


        if (
            !container
        ) {

            return;
        }


        if (
            !recommendation
        ) {

            container.hidden =
                true;


            return;
        }


        container.hidden =
            false;


        setText(
            "mastery-recommendation-name",
            recommendation.name
        );


        setText(
            "mastery-recommendation-reason",
            recommendation
                .recommendationReason
        );


        const button =
            document.getElementById(
                "mastery-practice-button"
            );


        if (
            button
        ) {

            button.onclick =
                () => {

                    selectRecommendedCipher(
                        recommendation.cipher
                    );

                };
        }
    }


    /*
    =====================================================
    RECOMMENDED PRACTICE
    =====================================================
    */

    function selectRecommendedCipher(
        cipher
    ) {

        const cipherSelect =
            document.getElementById(
                "practice-cipher"
            );


        const difficultySelect =
            document.getElementById(
                "practice-difficulty"
            );


        if (
            !cipherSelect
            ||
            !difficultySelect
        ) {

            return;
        }


        let exists =
            [
                ...cipherSelect.options
            ]
            .some(
                option =>
                    option.value ===
                    cipher
            );


        if (
            !exists
            &&
            typeof DifficultyEngine !==
            "undefined"
        ) {

            const difficulties =
                [
                    "Easy",
                    "Medium",
                    "Hard"
                ];


            const validDifficulty =
                difficulties.find(
                    difficulty =>
                        DifficultyEngine
                            .isCipherAllowed(
                                cipher,
                                difficulty
                            )
                );


            if (
                validDifficulty
            ) {

                difficultySelect.value =
                    validDifficulty;


                difficultySelect.dispatchEvent(
                    new Event(
                        "change",
                        {
                            bubbles:
                                true
                        }
                    )
                );


                if (
                    typeof populatePracticeCiphers ===
                    "function"
                ) {

                    populatePracticeCiphers();
                }


                exists =
                    [
                        ...cipherSelect.options
                    ]
                    .some(
                        option =>
                            option.value ===
                            cipher
                    );
            }
        }


        if (
            exists
        ) {

            cipherSelect.value =
                cipher;


            cipherSelect.dispatchEvent(
                new Event(
                    "change",
                    {
                        bubbles:
                            true
                    }
                )
            );
        }

    }


    /*
    =====================================================
    FULL MASTERY LIST
    =====================================================
    */

    function renderMasteryList() {

        const container =
            document.getElementById(
                "mastery-list"
            );


        if (
            !container
        ) {

            return;
        }


        const ranking =
            MasteryEngine
                .getMasteryRanking();


        container.innerHTML =
            "";


        if (
            ranking.length ===
            0
        ) {

            container.innerHTML =
                `

                <div class="mastery-empty">
                    No mastery data yet.
                </div>

                `;


            return;
        }


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


    /*
    =====================================================
    ROW
    =====================================================
    */

    function createMasteryRow(
        item
    ) {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "mastery-row";


        const top =
            document.createElement(
                "div"
            );


        top.className =
            "mastery-row-top";


        const identity =
            document.createElement(
                "div"
            );


        const name =
            document.createElement(
                "div"
            );


        name.className =
            "mastery-name";


        name.textContent =
            item.name;


        const rank =
            document.createElement(
                "div"
            );


        rank.className =
            "mastery-rank";


        rank.textContent =
            item.rank
                .toUpperCase();


        identity.appendChild(
            name
        );


        identity.appendChild(
            rank
        );


        const score =
            document.createElement(
                "div"
            );


        score.className =
            "mastery-score";


        score.textContent =
            item.mastery;


        top.appendChild(
            identity
        );


        top.appendChild(
            score
        );


        const track =
            document.createElement(
                "div"
            );


        track.className =
            "mastery-track";


        const fill =
            document.createElement(
                "div"
            );


        fill.className =
            "mastery-fill";


        fill.style.width =
            `${item.mastery}%`;


        track.appendChild(
            fill
        );


        const stats =
            document.createElement(
                "div"
            );


        stats.className =
            "mastery-row-stats";


        if (
            item.attempts ===
            0
        ) {

            stats.textContent =
                "Not practiced yet";

        } else {

            appendStat(
                stats,
                `${item.solved}/${item.attempts} solved`
            );


            appendStat(
                stats,
                `${item.solveRate}% success`
            );


            if (
                item.averageTime >
                0
            ) {

                appendStat(
                    stats,
                    `${formatTime(
                        item.averageTime
                    )} avg`
                );
            }


            if (
                item.hardSolves >
                0
            ) {

                appendStat(
                    stats,
                    `${item.hardSolves} Hard`
                );
            }
        }


        row.appendChild(
            top
        );


        row.appendChild(
            track
        );


        row.appendChild(
            stats
        );


        return row;
    }


    /*
    =====================================================
    HELPERS
    =====================================================
    */

    function appendStat(
        container,
        text
    ) {

        const span =
            document.createElement(
                "span"
            );


        span.textContent =
            text;


        container.appendChild(
            span
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

        update,

        setCollapsed

    };


})();