/*
=========================================================
THE DAILY CIPHER
Statistics + Sharing v2
=========================================================
*/


/*
=========================================================
GENERAL STATISTICS
=========================================================
*/

function getStatsSummary() {

    const stats =
        loadStats();


    const results =
        Object.values(
            stats.dailyResults || {}
        );


    const winRate =
        stats.totalPlayed === 0
            ? 0
            : Math.round(
                (
                    stats.totalWon
                    /
                    stats.totalPlayed
                )
                *
                100
            );


    const averageGuesses =
        stats.totalWon === 0
            ? "0.00"
            : (
                stats.totalGuesses
                /
                stats.totalWon
            ).toFixed(2);


    let totalScore = 0;

    let totalHints = 0;


    for (
        const result
        of results
    ) {

        totalScore +=
            Number(
                result.score || 0
            );


        totalHints +=
            Number(
                result.hintCount || 0
            );
    }


    return {

        ...stats,

        winRate,

        averageGuesses,

        totalScore,

        totalHints

    };
}


/*
=========================================================
OPEN / CLOSE MODAL
=========================================================
*/

function openStatsModal() {

    const modal =
        document.getElementById(
            "stats-modal"
        );


    if (!modal) {
        return;
    }


    updateStatsModal();


    modal.classList.remove(
        "hidden"
    );
}


function closeStatsModal() {

    const modal =
        document.getElementById(
            "stats-modal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );
}


/*
=========================================================
UPDATE MODAL
=========================================================
*/

function updateStatsModal() {

    const stats =
        getStatsSummary();


    setText(
        "stat-played",
        stats.totalPlayed
    );


    setText(
        "stat-winrate",
        `${stats.winRate}%`
    );


    setText(
        "stat-streak",
        stats.currentStreak
    );


    setText(
        "stat-max-streak",
        stats.maxStreak
    );


    setText(
        "stat-wins",
        stats.totalWon
    );


    setText(
        "stat-average",
        stats.averageGuesses
    );


    setText(
        "stat-total-score",
        stats.totalScore
    );


    setText(
        "stat-total-hints",
        stats.totalHints
    );


    updateDifficultyStats();

    updateSharePreview();
}


/*
=========================================================
SAFE TEXT HELPER
=========================================================
*/

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;
    }
}


/*
=========================================================
DIFFICULTY STATISTICS
=========================================================
*/

function getDifficultyStats(
    difficulty
) {

    const stats =
        loadStats();


    const results =
        Object.values(
            stats.dailyResults || {}
        )
        .filter(
            result =>
                String(
                    result.difficulty
                )
                .toLowerCase()
                ===
                difficulty.toLowerCase()
        );


    const played =
        results.length;


    const won =
        results.filter(
            result =>
                result.solved === true
        ).length;


    const totalScore =
        results.reduce(
            (
                total,
                result
            ) =>
                total
                +
                Number(
                    result.score || 0
                ),
            0
        );


    return {

        played,

        won,

        totalScore

    };
}


function updateDifficultyStats() {

    const difficulties = [
        "Easy",
        "Medium",
        "Hard"
    ];


    difficulties.forEach(
        difficulty => {

            const stats =
                getDifficultyStats(
                    difficulty
                );


            const id =
                difficulty
                    .toLowerCase();


            setText(
                `stat-${id}-record`,
                `${stats.won} / ${stats.played}`
            );


            setText(
                `stat-${id}-score`,
                `${stats.totalScore} pts`
            );

        }
    );
}


/*
=========================================================
TODAY'S RESULT LOOKUP
=========================================================
*/

function getTodayResult(
    difficulty
) {

    const stats =
        loadStats();


    /*
    First try today's real date.
    */

    const today =
        getTodayString();


    const todayKey =
        `${today}_${difficulty}`;


    if (
        stats.dailyResults
        &&
        stats.dailyResults[
            todayKey
        ]
    ) {

        return stats.dailyResults[
            todayKey
        ];
    }


    /*
    DEVELOPMENT FALLBACK

    Your Daily page currently loads the
    latest available puzzle date when
    today's JSON puzzles do not exist.

    Therefore Stats should do the same
    while the site is under development.
    */

    const keys =
        Object.keys(
            stats.dailyResults || {}
        );


    const matchingKeys =
        keys
            .filter(
                key =>
                    key.endsWith(
                        `_${difficulty}`
                    )
            )
            .sort()
            .reverse();


    if (
        matchingKeys.length === 0
    ) {

        return null;
    }


    return stats.dailyResults[
        matchingKeys[0]
    ];
}


/*
=========================================================
WORDLE-STYLE BLOCKS
=========================================================
*/

function buildResultBlocks(
    result
) {

    if (!result) {

        return "⬜⬜⬜⬜⬜⬜";
    }


    if (
        !result.solved
    ) {

        return "🟥🟥🟥🟥🟥🟥";
    }


    const guesses =
        Math.min(
            Number(
                result.guessesUsed || 1
            ),
            6
        );


    const remaining =
        Math.max(
            0,
            6 - guesses
        );


    return (
        "🟩".repeat(
            guesses
        )
        +
        "⬜".repeat(
            remaining
        )
    );
}


/*
=========================================================
SHARE PREVIEW
=========================================================
*/

function updateSharePreview() {

    const preview =
        document.getElementById(
            "share-grid"
        );


    if (!preview) {
        return;
    }


    preview.innerHTML = "";


    const difficulties = [
        "Easy",
        "Medium",
        "Hard"
    ];


    difficulties.forEach(
        difficulty => {

            const result =
                getTodayResult(
                    difficulty
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "share-result-row";


            const name =
                document.createElement(
                    "span"
                );


            name.className =
                "share-result-name";


            name.textContent =
                difficulty.toUpperCase();


            const blocks =
                document.createElement(
                    "span"
                );


            blocks.className =
                "share-result-blocks";


            blocks.textContent =
                buildResultBlocks(
                    result
                );


            const score =
                document.createElement(
                    "strong"
                );


            score.className =
                "share-result-score";


            score.textContent =
                result
                    ? `${result.score} pts`
                    : "—";


            row.appendChild(
                name
            );


            row.appendChild(
                blocks
            );


            row.appendChild(
                score
            );


            preview.appendChild(
                row
            );

        }
    );
}


/*
=========================================================
BUILD SHARE TEXT
=========================================================
*/

function buildShareText() {

    const stats =
        getStatsSummary();


    const difficulties = [
        "Easy",
        "Medium",
        "Hard"
    ];


    const lines = [

        "THE DAILY CIPHER 🔐",

        ""

    ];


    let completed = 0;

    let dailyScore = 0;


    difficulties.forEach(
        difficulty => {

            const result =
                getTodayResult(
                    difficulty
                );


            lines.push(
                difficulty.toUpperCase()
            );


            if (!result) {

                lines.push(
                    "⬜⬜⬜⬜⬜⬜ —"
                );


                lines.push(
                    "Not completed"
                );


                lines.push(
                    ""
                );


                return;
            }


            completed++;


            dailyScore +=
                Number(
                    result.score || 0
                );


            const blocks =
                buildResultBlocks(
                    result
                );


            const guessText =
                result.solved
                    ? `${result.guessesUsed}/6`
                    : "X/6";


            lines.push(
                `${blocks} ${guessText}`
            );


            lines.push(
                `💡 ${result.hintCount || 0} hint`
                +
                (
                    Number(
                        result.hintCount || 0
                    ) === 1
                        ? ""
                        : "s"
                )
                +
                ` • ${result.score || 0} pts`
            );


            lines.push(
                ""
            );

        }
    );


    lines.push(
        `${completed}/3 COMPLETED`
    );


    lines.push(
        `🏆 ${dailyScore} PTS`
    );


    lines.push(
        `🔥 ${stats.currentStreak} DAY STREAK`
    );


    lines.push(
        ""
    );


    lines.push(
        "thedailycipher.org"
    );


    return lines.join(
        "\n"
    );
}


/*
=========================================================
SHARE RESULTS
=========================================================
*/

async function shareStats() {

    const text =
        buildShareText();


    const feedback =
        document.getElementById(
            "share-feedback"
        );


    /*
    Mobile / supported browsers:
    open the operating system's
    native Share menu.
    */

    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title:
                    "The Daily Cipher",

                text

            });


            if (feedback) {

                feedback.textContent =
                    "Results shared!";
            }


            return;


        } catch (error) {

            if (
                error.name ===
                "AbortError"
            ) {

                return;
            }
        }
    }


    /*
    Desktop fallback:
    copy the result to clipboard.
    */

    try {

        await navigator.clipboard
            .writeText(
                text
            );


        if (feedback) {

            feedback.textContent =
                "✓ Results copied to clipboard!";
        }


    } catch (error) {

        console.error(
            "Could not copy results:",
            error
        );


        if (feedback) {

            feedback.textContent =
                "Could not copy automatically.";
        }
    }
}


/*
=========================================================
EVENT LISTENERS
=========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const openButton =
            document.getElementById(
                "stats-button"
            );


        const closeButton =
            document.getElementById(
                "close-stats"
            );


        const shareButton =
            document.getElementById(
                "share-stats-button"
            );


        const modal =
            document.getElementById(
                "stats-modal"
            );


        if (openButton) {

            openButton.addEventListener(
                "click",
                openStatsModal
            );
        }


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeStatsModal
            );
        }


        if (shareButton) {

            shareButton.addEventListener(
                "click",
                shareStats
            );
        }


        /*
        Click outside modal to close.
        */

        if (modal) {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeStatsModal();
                    }
                }
            );
        }


        /*
        Escape key closes modal.
        */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeStatsModal();
                }
            }
        );
    }
);