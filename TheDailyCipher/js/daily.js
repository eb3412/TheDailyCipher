/*
=========================================================
THE DAILY CIPHER
Daily Challenge Controller v3.0
=========================================================

Requires:

- storage.js
- utils.js
- cipherEngine.js
- difficultyEngine.js
- progressionEngine.js
- masteryEngine.js
- streakEngine.js
- achievementEngine.js
- cloudSync.js

Daily results are now recorded through the same
central activity-history system used by Practice.

=========================================================
*/


let activeDifficulty =
    "Easy";


let activeCipher =
    null;


let currentDayCiphers =
    [];


let activeGuesses =
    0;


let activeHints =
    [];


let revealedHintIndexes =
    [];


/*
Tracks elapsed time for the current Daily puzzle.
*/

let dailyPuzzleStartTime =
    null;


const MAX_GUESSES =
    6;


/*
=========================================================
LOAD DAILY PUZZLES
=========================================================
*/

async function loadDailyCiphers() {

    try {

        const response =
            await fetch(
                "data/ciphers.json"
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Could not load cipher data."
            );
        }


        const allCiphers =
            await response.json();


        const today =
            getTodayString();


        currentDayCiphers =
            allCiphers.filter(
                cipher =>
                    cipher.date ===
                    today
            );


       


        if (
    currentDayCiphers.length ===
    0
) {

    activeCipher =
        null;


    const output =
        document.getElementById(
            "ciphertext-output"
        );


    const cipherName =
        document.getElementById(
            "cipher-name"
        );


    const meta =
        document.getElementById(
            "meta-display"
        );


    const rules =
        document.getElementById(
            "rules-clue-output"
        );


    const input =
        document.getElementById(
            "solution-input"
        );


    const feedback =
        document.getElementById(
            "status-feedback"
        );


    if (
        output
    ) {

        output.textContent =
            "TODAY'S PUZZLES ARE NOT AVAILABLE YET.";
    }


    if (
        cipherName
    ) {

        cipherName.textContent =
            "Daily Challenge";
    }


    if (
        meta
    ) {

        meta.textContent =
            `${today} • NOT YET AVAILABLE`;
    }


    if (
        rules
    ) {

        rules.textContent =
            "Check back when today's Daily Cipher challenges are released.";
    }


    if (
        input
    ) {

        input.value =
            "";

        input.disabled =
            true;
    }


    if (
        feedback
    ) {

        feedback.textContent =
            "";
    }


    hideCipherFamily();

    resetPuzzleSession();

    updateDifficultyTabs();

    updateHintInterface();


    console.warn(
        `No Daily Cipher puzzles are scheduled for ${today}.`
    );


    return;
}


        renderDailyCipher();


    } catch (
        error
    ) {

        console.error(
            "Daily puzzle loading error:",
            error
        );


        document.getElementById(
            "ciphertext-output"
        ).textContent =
            "FAILED TO LOAD DAILY PUZZLE.";
    }
}


/*
=========================================================
RENDER PUZZLE
=========================================================
*/

function renderDailyCipher() {

    const cipher =
        currentDayCiphers.find(
            item =>
                item.difficulty
                    .toLowerCase()
                ===
                activeDifficulty
                    .toLowerCase()
        );


    const output =
        document.getElementById(
            "ciphertext-output"
        );


    const input =
        document.getElementById(
            "solution-input"
        );


    const feedback =
        document.getElementById(
            "status-feedback"
        );


    resetPuzzleSession();


    /*
    =====================================================
    NO PUZZLE FOR SELECTED DIFFICULTY
    =====================================================
    */

    if (
        !cipher
    ) {

        activeCipher =
            null;


        output.textContent =
            "COMING SOON";


        document.getElementById(
            "cipher-name"
        ).textContent =
            `${activeDifficulty} Challenge`;


        document.getElementById(
            "meta-display"
        ).textContent =
            `${activeDifficulty.toUpperCase()} • NOT YET AVAILABLE`;


        document.getElementById(
            "rules-clue-output"
        ).textContent =
            "This difficulty has not been released yet.";


        hideCipherFamily();


        input.value =
            "";


        input.disabled =
            true;


        feedback.textContent =
            "";


        updateDifficultyTabs();


        return;
    }


    activeCipher =
        prepareCipherForDifficulty(
            cipher
        );


    input.disabled =
        false;


    document.getElementById(
        "daily-date"
    ).textContent =
        activeCipher.date;


    renderDifficultyInformation();


    output.textContent =
        activeCipher.ciphertext;


    input.value =
        "";


    feedback.textContent =
        "";


    updateDifficultyTabs();

    updateHintInterface();


    /*
    Start timing this Daily puzzle.

    If it was already completed,
    checkPreviousCompletion() will disable it again.
    */

    dailyPuzzleStartTime =
        Date.now();


    checkPreviousCompletion();
}


/*
=========================================================
PREPARE CIPHER
=========================================================
*/

function prepareCipherForDifficulty(
    cipher
) {

    /*
    Older ciphers.json entries may contain
    only a single "hint".

    Convert them into the progressive format
    when necessary.
    */

    let hints =
        Array.isArray(
            cipher.hints
        )
            ?
            cipher.hints
            :
            [];


    if (
        hints.length ===
        0

        &&

        cipher.hint
    ) {

        hints = [

            {
                level:
                    1,

                title:
                    "Hint",

                text:
                    cipher.hint
            }

        ];
    }


    /*
    If this puzzle came from an older JSON format,
    ask CipherEngine to generate the standard hints.
    */

    if (
        hints.length <=
        1

        &&

        window.CipherEngine
    ) {

        const cipherID =
            getCipherID(
                cipher
            );


        const generatedHints =
            CipherEngine
                .createHints(
                    cipherID,
                    cipher.parameters
                    ||
                    {}
                );


        if (
            generatedHints.length >
            0
        ) {

            hints =
                generatedHints;
        }
    }


    const prepared = {

        ...cipher,

        hints

    };


    /*
    Required givens belong in Starting Information, not behind
    a score-reducing hint. Rebuild context for legacy JSON too.
    */
    if (window.ProblemInfoEngine) {

        const cipherID = getCipherID(prepared);

        prepared.problem_mode =
            prepared.problem_mode
            ||
            ProblemInfoEngine.getProblemMode(cipherID);

        prepared.startingInfo =
            prepared.startingInfo
            ||
            ProblemInfoEngine.createStartingInfo({
                ...prepared,
                type: cipherID
            });

        prepared.hints =
            ProblemInfoEngine.createHints({
                ...prepared,
                type: cipherID
            });
    }


    activeHints =
        DifficultyEngine
            .prepareHints(
                prepared
            );


    return prepared;
}


/*
=========================================================
CIPHER IDENTIFICATION
=========================================================
*/

function getCipherID(
    cipher
) {

    if (
        cipher.cipher_id
    ) {

        return String(
            cipher.cipher_id
        )
        .toLowerCase();
    }


    if (
        cipher.type
    ) {

        return String(
            cipher.type
        )
        .toLowerCase();
    }


    const name =
        String(
            cipher.cipher_type
            ||
            ""
        )
        .toLowerCase();


    /*
    These fallbacks support older Daily JSON entries.
    */

    if (
        name.includes(
            "caesar"
        )
    ) {

        return "caesar";
    }


    if (
        name.includes(
            "atbash"
        )
    ) {

        return "atbash";
    }


    if (
        name.includes(
            "affine"
        )
    ) {

        return "affine";
    }


    if (
        name.includes(
            "rail"
        )
    ) {

        return "railfence";
    }


    if (
        name.includes(
            "bacon"
        )
    ) {

        return "baconian";
    }


    if (
        name.includes(
            "aristocrat"
        )

        ||

        name.includes(
            "substitution"
        )
    ) {

        return "aristocrat";
    }


    /*
    Additional current-site cipher names.
    */

    if (
        name.includes(
            "vigen"
        )
    ) {

        return "vigenere";
    }


    if (
        name.includes(
            "nihilist"
        )
    ) {

        return "nihilist";
    }


    if (
        name.includes(
            "hill"
        )
    ) {

        return "hill";
    }


    if (
        name.includes(
            "fractionated"
        )
    ) {

        return "fractionatedmorse";
    }


    if (
        name.includes(
            "porta"
        )
    ) {

        return "porta";
    }


    if (
        name.includes(
            "playfair"
        )
    ) {

        return "playfair";
    }


    return "";
}


/*
=========================================================
DIFFICULTY INFORMATION
=========================================================
*/

function renderDifficultyInformation() {

    const info =
        DifficultyEngine
            .createInitialInfo({

                ...activeCipher,

                type:
                    getCipherID(
                        activeCipher
                    )

            });


    const cipherName =
        document.getElementById(
            "cipher-name"
        );


    const meta =
        document.getElementById(
            "meta-display"
        );


    const rules =
        document.getElementById(
            "rules-clue-output"
        );


    /*
    Codebusters-style questions identify the cipher type.
    Difficulty comes from the cipher and the amount of supplied
    information, not from hiding the question category.
    */

    if (
        info.cipherName
    ) {

        cipherName.textContent =
            info.cipherName;


        meta.textContent =
            `${info.cipherName} • ${activeDifficulty}`;

    } else {

        cipherName.textContent =
            `${activeDifficulty} Mystery Cipher`;


        meta.textContent =
            `${activeDifficulty.toUpperCase()} • CIPHER TYPE HIDDEN`;
    }


    rules.textContent =
        info.message;


    /*
    Easy can show broad cipher family.
    */

    if (
        info.cipherFamily
    ) {

        showCipherFamily(
            info.cipherFamily
        );

    } else {

        hideCipherFamily();
    }


    const startingInfoContainer =
        document.getElementById(
            "daily-starting-info"
        );


    if (startingInfoContainer && window.ProblemInfoEngine) {

        const startingInfo =
            activeCipher.startingInfo
            ||
            ProblemInfoEngine.createStartingInfo({
                ...activeCipher,
                type: getCipherID(activeCipher)
            });


        ProblemInfoEngine.render(
            startingInfoContainer,
            startingInfo
        );
    }
}


/*
=========================================================
CIPHER FAMILY
=========================================================
*/

function showCipherFamily(
    family
) {

    const row =
        document.getElementById(
            "cipher-family-row"
        );


    const output =
        document.getElementById(
            "cipher-family-output"
        );


    if (
        !row

        ||

        !output
    ) {

        return;
    }


    output.textContent =
        family;


    row.classList.remove(
        "hidden"
    );
}


function hideCipherFamily() {

    const row =
        document.getElementById(
            "cipher-family-row"
        );


    if (
        row
    ) {

        row.classList.add(
            "hidden"
        );
    }
}


/*
=========================================================
DIFFICULTY TABS
=========================================================
*/

function switchDifficulty(
    difficulty
) {

    activeDifficulty =
        difficulty;


    renderDailyCipher();
}


function updateDifficultyTabs() {

    [
        "Easy",
        "Medium",
        "Hard"
    ]
    .forEach(
        difficulty => {

            const button =
                document.getElementById(
                    `tab-${difficulty}`
                );


            if (
                !button
            ) {

                return;
            }


            const isActive =
                difficulty ===
                    activeDifficulty;


            button.classList.toggle(
                "active",
                isActive
            );


            button.setAttribute(
                "aria-pressed",
                isActive
                    ? "true"
                    : "false"
            );

        }
    );
}


/*
=========================================================
PROGRESSIVE HINT SYSTEM
=========================================================
*/

function revealNextHint() {

    if (
        !activeCipher
    ) {

        return;
    }


    const nextIndex =
        revealedHintIndexes.length;


    if (
        nextIndex >=
        activeHints.length
    ) {

        return;
    }


    const hint =
        DifficultyEngine
            .revealHint(
                activeHints,
                nextIndex
            );


    if (
        !hint
    ) {

        return;
    }


    revealedHintIndexes.push(
        nextIndex
    );


    renderRevealedHints();

    updateHintInterface();
}


/*
=========================================================
RENDER REVEALED HINTS
=========================================================
*/

function renderRevealedHints() {

    const container =
        document.getElementById(
            "revealed-hints"
        );


    if (
        !container
    ) {

        return;
    }


    container.innerHTML =
        "";


    for (
        const index
        of revealedHintIndexes
    ) {

        const hint =
            activeHints[
                index
            ];


        if (
            !hint
        ) {

            continue;
        }


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "revealed-hint-card";


        const number =
            document.createElement(
                "div"
            );


        number.className =
            "revealed-hint-number";


        number.textContent =
            `HINT ${index + 1} • -${hint.penalty} POINTS`;


        const title =
            document.createElement(
                "div"
            );


        title.className =
            "revealed-hint-title";


        title.textContent =
            hint.title
            ||
            `Hint ${index + 1}`;


        const text =
            document.createElement(
                "p"
            );


        text.className =
            "revealed-hint-text";


        text.textContent =
            hint.text;


        card.appendChild(
            number
        );


        card.appendChild(
            title
        );


        card.appendChild(
            text
        );


        container.appendChild(
            card
        );
    }
}


/*
=========================================================
HINT INTERFACE
=========================================================
*/

function updateHintInterface() {

    const button =
        document.getElementById(
            "reveal-hint-button"
        );


    const counter =
        document.getElementById(
            "hint-counter"
        );


    const preview =
        document.getElementById(
            "hint-penalty-preview"
        );


    if (
        !button

        ||

        !counter

        ||

        !preview
    ) {

        return;
    }


    const used =
        revealedHintIndexes.length;


    counter.textContent =
        `${used} hint${used === 1 ? "" : "s"} used`;


    if (
        !activeCipher

        ||

        activeHints.length ===
        0
    ) {

        button.disabled =
            true;


        button.textContent =
            "No Hints Available";


        preview.textContent =
            "";


        return;
    }


    if (
        used >=
        activeHints.length
    ) {

        button.disabled =
            true;


        button.textContent =
            "All Hints Revealed";


        preview.textContent =
            "No additional hints available.";


        return;
    }


    button.disabled =
        false;


    button.textContent =
        `Reveal Hint ${used + 1}`;


    const nextHint =
        activeHints[
            used
        ];


    preview.textContent =
        `Next hint costs ${nextHint.penalty} points.`;
}


/*
=========================================================
DAILY ELAPSED TIME
=========================================================
*/

function getDailyElapsedSeconds() {

    if (
        !dailyPuzzleStartTime
    ) {

        return 0;
    }


    return Math.max(
        0,
        Math.round(
            (
                Date.now()
                -
                dailyPuzzleStartTime
            )
            /
            1000
        )
    );
}


/*
=========================================================
DAILY RESULT XP
=========================================================

Uses the same ProgressionEngine calculation as Practice.
=========================================================
*/

function calculateDailyXP(
    result
) {

    if (
        typeof ProgressionEngine ===
        "undefined"
    ) {

        return 0;
    }


    return ProgressionEngine
        .calculateActivityXP({

            source:
                "daily",

            cipher:
                getCipherID(
                    activeCipher
                ),

            difficulty:
                activeDifficulty,

            solved:
                result.solved,

            score:
                result.score,

            guesses:
                result.guessesUsed,

            hints:
                result.hintCount,

            timeSeconds:
                result.elapsedSeconds,

            mode:
                "daily"

        });
}


/*
=========================================================
ANSWER SUBMISSION
=========================================================
*/

function evaluateSubmission() {

    if (
        !activeCipher
    ) {

        return;
    }


    const input =
        document.getElementById(
            "solution-input"
        );


    const feedback =
        document.getElementById(
            "status-feedback"
        );


    input.value =
        input.value.toUpperCase();


    const userAnswer =
        normalizeAnswer(
            input.value
        );


    const correctAnswer =
        normalizeAnswer(
            activeCipher.solution
        );


    if (
        !userAnswer
    ) {

        feedback.textContent =
            "Enter an answer first.";


        feedback.className =
            "feedback error";


        return;
    }


    activeGuesses++;


    /*
    =====================================================
    CORRECT
    =====================================================
    */

    if (
        userAnswer ===
        correctAnswer
    ) {

        const result =
            DifficultyEngine
                .createResult({

                    difficulty:
                        activeDifficulty,

                    solved:
                        true,

                    guessesUsed:
                        activeGuesses,

                    hintsUsed:
                        revealedHintIndexes

                });


        result.elapsedSeconds =
            getDailyElapsedSeconds();


        result.cipher =
            getCipherID(
                activeCipher
            );


        result.mode =
            "daily";


        result.reason =
            "solved";


        result.xpEarned =
            calculateDailyXP(
                result
            );


        feedback.textContent =
            "✓ CORRECT — CIPHER CRACKED";


        feedback.className =
            "feedback success";


        recordWin(
            result
        );


        displayPuzzleScore(
            result
        );


        input.disabled =
            true;


        disableHints();


        return;
    }


    /*
    =====================================================
    INCORRECT
    =====================================================
    */

    const remaining =
        MAX_GUESSES
        -
        activeGuesses;


    if (
        remaining <=
        0
    ) {

        const result =
            DifficultyEngine
                .createResult({

                    difficulty:
                        activeDifficulty,

                    solved:
                        false,

                    guessesUsed:
                        activeGuesses,

                    hintsUsed:
                        revealedHintIndexes

                });


        result.elapsedSeconds =
            getDailyElapsedSeconds();


        result.cipher =
            getCipherID(
                activeCipher
            );


        result.mode =
            "daily";


        result.reason =
            "attempts";


        result.xpEarned =
            calculateDailyXP(
                result
            );


        feedback.textContent =
            `OUT OF ATTEMPTS — ANSWER: ${correctAnswer}`;


        feedback.className =
            "feedback error";


        recordLoss(
            result
        );


        displayPuzzleScore(
            result
        );


        input.disabled =
            true;


        disableHints();


        return;
    }


    feedback.textContent =
        `Incorrect. ${remaining} attempts remaining.`;


    feedback.className =
        "feedback error";
}
/*
=========================================================
SCORE DISPLAY
=========================================================
*/

function displayPuzzleScore(
    result
) {

    const box =
        document.getElementById(
            "daily-score-result"
        );


    const number =
        document.getElementById(
            "daily-score-number"
        );


    const detail =
        document.getElementById(
            "daily-score-detail"
        );


    if (
        !box
        ||
        !number
        ||
        !detail
    ) {

        return;
    }


    number.textContent =
        `${result.score} pts`;


    if (
        result.solved
    ) {

        detail.textContent =
            `${result.guessesUsed} guess`
            +
            (
                result.guessesUsed ===
                1
                    ?
                    ""
                    :
                    "es"
            )
            +
            ` • ${result.hintCount} hint`
            +
            (
                result.hintCount ===
                1
                    ?
                    ""
                    :
                    "s"
            )
            +
            ` • ${result.elapsedSeconds}s`
            +
            ` • +${result.xpEarned} XP`;

    } else {

        detail.textContent =
            `Unsolved`
            +
            ` • ${result.hintCount} hint`
            +
            (
                result.hintCount ===
                1
                    ?
                    ""
                    :
                    "s"
            )
            +
            ` • ${result.elapsedSeconds}s`
            +
            ` • +${result.xpEarned} XP`;
    }


    box.classList.remove(
        "hidden"
    );
}


function hidePuzzleScore() {

    const box =
        document.getElementById(
            "daily-score-result"
        );


    if (
        box
    ) {

        box.classList.add(
            "hidden"
        );
    }
}


/*
=========================================================
COMPLETION KEY
=========================================================
*/

function getCompletionKey() {

    return (
        `${activeCipher.date}_${activeDifficulty}`
    );
}


/*
=========================================================
RECORD WIN
=========================================================
*/

function recordWin(
    result
) {

    const stats =
        loadStats();


    const key =
        getCompletionKey();


    /*
    Prevent duplicate Daily completion for
    the same date + difficulty.
    */

    if (
        stats.completedDates[
            key
        ]
    ) {

        return;
    }


    /*
    =====================================================
    DAILY-SPECIFIC STATS
    =====================================================
    */

    stats.totalPlayed++;

    stats.totalWon++;

    stats.totalGuesses +=
        activeGuesses;


    updateStreak(
        stats
    );


    stats.completedDates[
        key
    ] =
        "WON";


    stats.dailyResults[
        key
    ] =
        result;


    saveStats(
        stats
    );


    updateStreakDisplay();


    /*
    =====================================================
    CENTRAL ACTIVITY HISTORY
    =====================================================

    Same structure used by Practice.
    =====================================================
    */

    recordDailyActivity(
        result
    );


    /*
    =====================================================
    LOCAL PROGRESSION SYSTEMS
    =====================================================
    */

    updateDailyProgressionSystems();


    /*
    =====================================================
    CLOUD
    =====================================================
    */

    syncDailyToCloud();
}


/*
=========================================================
RECORD LOSS
=========================================================
*/

function recordLoss(
    result
) {

    const stats =
        loadStats();


    const key =
        getCompletionKey();


    if (
        stats.completedDates[
            key
        ]
    ) {

        return;
    }


    /*
    =====================================================
    DAILY-SPECIFIC STATS
    =====================================================
    */

    stats.totalPlayed++;


    stats.completedDates[
        key
    ] =
        "LOST";


    stats.dailyResults[
        key
    ] =
        result;


    stats.currentStreak =
        0;


    saveStats(
        stats
    );


    updateStreakDisplay();


    /*
    =====================================================
    CENTRAL ACTIVITY HISTORY
    =====================================================
    */

    recordDailyActivity(
        result
    );


    /*
    =====================================================
    LOCAL PROGRESSION SYSTEMS
    =====================================================
    */

    updateDailyProgressionSystems();


    /*
    =====================================================
    CLOUD
    =====================================================
    */

    syncDailyToCloud();
}


/*
=========================================================
RECORD CENTRAL DAILY ACTIVITY
=========================================================
*/

function recordDailyActivity(
    result
) {

    if (
        typeof recordActivity !==
        "function"
    ) {

        console.warn(
            "Daily result could not be added to activity history because recordActivity() is unavailable."
        );


        return;
    }


    recordActivity({

        source:
            "daily",

        cipher:
            result.cipher,

        difficulty:
            activeDifficulty,

        solved:
            result.solved,

        score:
            result.score,

        guesses:
            result.guessesUsed,

        hints:
            result.hintCount,

        timeSeconds:
            result.elapsedSeconds,

        mode:
            "daily",

        metadata: {

            reason:
                result.reason,

            xpEarned:
                result.xpEarned,

            dailyDate:
                activeCipher.date,

            perfectScore:
                result.perfectScore

        }

    });
}


/*
=========================================================
UPDATE SHARED PROGRESSION SYSTEMS
=========================================================
*/

function updateDailyProgressionSystems() {

    /*
    XP / level are calculated from central activity
    history, so no extra XP write is needed here.
    */

    if (
        typeof MasteryUI !==
        "undefined"
        &&
        typeof MasteryUI.update ===
        "function"
    ) {

        MasteryUI.update();
    }


    if (
        typeof StreakUI !==
        "undefined"
        &&
        typeof StreakUI.update ===
        "function"
    ) {

        StreakUI.update();
    }


    if (
        typeof AchievementUI !==
        "undefined"
        &&
        typeof AchievementUI.syncAndNotify ===
        "function"
    ) {

        AchievementUI
            .syncAndNotify();

    } else if (
        typeof AchievementEngine !==
        "undefined"
        &&
        typeof AchievementEngine.syncUnlocks ===
        "function"
    ) {

        AchievementEngine
            .syncUnlocks();
    }
}


/*
=========================================================
CLOUD SYNC
=========================================================
*/

function syncDailyToCloud() {

    if (
        typeof CloudSync ===
        "undefined"
    ) {

        return;
    }


    if (
        typeof CloudSync.syncNow !==
        "function"
    ) {

        return;
    }


    CloudSync.syncNow({

        silent:
            true

    });
}


/*
=========================================================
DAILY STREAK
=========================================================
*/

function updateStreak(
    stats
) {

    const today =
        activeCipher.date;


    if (
        !stats.lastSolvedDate
    ) {

        stats.currentStreak =
            1;

    } else {

        const previous =
            new Date(
                stats.lastSolvedDate
            );


        const current =
            new Date(
                today
            );


        const difference =
            Math.round(
                (
                    current
                    -
                    previous
                )
                /
                (
                    1000
                    *
                    60
                    *
                    60
                    *
                    24
                )
            );


        if (
            difference ===
            1
        ) {

            stats.currentStreak++;

        } else if (
            difference !==
            0
        ) {

            stats.currentStreak =
                1;
        }
    }


    stats.lastSolvedDate =
        today;


    stats.maxStreak =
        Math.max(
            stats.maxStreak,
            stats.currentStreak
        );
}


/*
=========================================================
DAILY STREAK DISPLAY
=========================================================
*/

function updateStreakDisplay() {

    const stats =
        loadStats();


    const element =
        document.getElementById(
            "streak-indicator"
        );


    if (
        element
    ) {

        element.textContent =
            `🔥 ${stats.currentStreak}`;
    }
}


/*
=========================================================
PREVIOUS COMPLETION
=========================================================
*/

function checkPreviousCompletion() {

    if (
        !activeCipher
    ) {

        return;
    }


    const stats =
        loadStats();


    const key =
        getCompletionKey();


    const state =
        stats.completedDates[
            key
        ];


    const savedResult =
        stats.dailyResults
            ?
            stats.dailyResults[
                key
            ]
            :
            null;


    const input =
        document.getElementById(
            "solution-input"
        );


    if (
        !state
    ) {

        return;
    }


    input.disabled =
        true;


    disableHints();


    /*
    Don't continue timing an already completed puzzle.
    */

    dailyPuzzleStartTime =
        null;


    const feedback =
        document.getElementById(
            "status-feedback"
        );


    if (
        state ===
        "WON"
    ) {

        feedback.textContent =
            "✓ ALREADY SOLVED TODAY";


        feedback.className =
            "feedback success";

    } else {

        feedback.textContent =
            "PUZZLE ALREADY COMPLETED";


        feedback.className =
            "feedback error";
    }


    if (
        savedResult
    ) {

        displayPuzzleScore(
            savedResult
        );
    }
}


/*
=========================================================
SESSION RESET
=========================================================
*/

function resetPuzzleSession() {

    activeCipher =
        null;


    activeGuesses =
        0;


    activeHints =
        [];


    revealedHintIndexes =
        [];


    dailyPuzzleStartTime =
        null;


    const hints =
        document.getElementById(
            "revealed-hints"
        );


    if (
        hints
    ) {

        hints.innerHTML =
            "";
    }


    const feedback =
        document.getElementById(
            "status-feedback"
        );


    if (
        feedback
    ) {

        feedback.textContent =
            "";
    }


    hidePuzzleScore();
}


/*
=========================================================
DISABLE HINTS
=========================================================
*/

function disableHints() {

    const button =
        document.getElementById(
            "reveal-hint-button"
        );


    if (
        button
    ) {

        button.disabled =
            true;
    }
}


/*
=========================================================
UPPERCASE INPUT
=========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const solutionInput =
            document.getElementById(
                "solution-input"
            );


        if (
            !solutionInput
        ) {

            return;
        }


        solutionInput.addEventListener(
            "input",
            () => {

                solutionInput.value =
                    solutionInput.value
                        .toUpperCase();

            }
        );

    }
);