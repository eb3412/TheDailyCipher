/*
=========================================================
THE DAILY CIPHER
Practice Controller v4.0 — Codebusters Expansion
=========================================================
*/


let currentPractice =
    null;


let practiceHints =
    [];


let revealedPracticeHints =
    [];


let practiceGuesses =
    0;


let practiceFinished =
    false;


let timerInterval =
    null;


let timeRemaining =
    null;


let puzzleStartTime =
    null;


const sessionStats = {

    played: 0,

    solved: 0,

    score: 0

};


/*
=========================================================
PROGRESSION STATE
=========================================================
*/

let previousProgressionLevel =
    null;


let xpGainTimeout =
    null;


const MODE_CONFIG = {

    guided: {

        name:
            "Guided",

        maxGuesses:
            6,

        timeLimit:
            null,

        hints:
            true,

        description:
            "6 attempts • No timer • Progressive hints available"

    },


    competition: {

        name:
            "Competition",

        maxGuesses:
            4,

        timeLimit:
            180,

        hints:
            true,

        description:
            "4 attempts • 3 minute timer • Competition-style scoring"

    },


    speed: {

        name:
            "Speed",

        maxGuesses:
            3,

        timeLimit:
            90,

        hints:
            false,

        description:
            "3 attempts • 90 second timer • No hints • Time bonus"

    }

};


/*
=========================================================
PRACTICE PROGRESSION UI
=========================================================
*/


function updatePracticeProgressionUI(
    options = {}
) {

    if (
        typeof ProgressionEngine
        ===
        "undefined"
    ) {

        return;
    }


    const summary =
        ProgressionEngine
            .getProgressSummary();


    const levelElement =
        document.getElementById(
            "practice-level-number"
        );


    const titleElement =
        document.getElementById(
            "practice-level-title"
        );


    const totalXPElement =
        document.getElementById(
            "practice-total-xp"
        );


    const fillElement =
        document.getElementById(
            "practice-xp-fill"
        );


    const currentElement =
        document.getElementById(
            "practice-xp-current"
        );


    const percentElement =
        document.getElementById(
            "practice-xp-percent"
        );


    const remainingElement =
        document.getElementById(
            "practice-xp-remaining"
        );


    if (
        !levelElement
        ||
        !titleElement
        ||
        !totalXPElement
        ||
        !fillElement
    ) {

        return;
    }


    /*
    ---------------------------------------------
    LEVEL-UP DETECTION
    ---------------------------------------------
    */

    const oldLevel =
        previousProgressionLevel;


    const newLevel =
        summary.level;


    /*
    ---------------------------------------------
    MAIN VALUES
    ---------------------------------------------
    */

    levelElement.textContent =
        newLevel;


    titleElement.textContent =
        summary.title;


    totalXPElement.textContent =
        summary.totalXP
            .toLocaleString();


    fillElement.style.width =
        `${summary.progressPercent}%`;


    currentElement.textContent =
        `${summary.xpIntoLevel.toLocaleString()} / ${summary.xpNeededForLevel.toLocaleString()} XP`;


    percentElement.textContent =
        `${summary.progressPercent}%`;


    remainingElement.textContent =
        `${summary.xpRemaining.toLocaleString()} XP to Level ${newLevel + 1}`;


    /*
    ---------------------------------------------
    XP GAIN
    ---------------------------------------------
    */

    if (
        Number(
            options.xpEarned
        )
        >
        0
    ) {

        showPracticeXPGain(
            Number(
                options.xpEarned
            )
        );
    }


    /*
    ---------------------------------------------
    LEVEL UP MESSAGE
    ---------------------------------------------
    */

    if (
        oldLevel !==
        null

        &&

        newLevel >
        oldLevel
    ) {

        showPracticeLevelUp(
            oldLevel,
            newLevel,
            summary.title
        );
    }


    previousProgressionLevel =
        newLevel;
}


/*
=========================================================
XP GAIN INDICATOR
=========================================================
*/

function showPracticeXPGain(
    xp
) {

    const element =
        document.getElementById(
            "practice-xp-gain"
        );


    if (
        !element
    ) {

        return;
    }


    if (
        xpGainTimeout
    ) {

        clearTimeout(
            xpGainTimeout
        );
    }


    element.textContent =
        `+${xp} XP`;


    element.classList.add(
        "show"
    );


    xpGainTimeout =
        setTimeout(
            () => {

                element.classList.remove(
                    "show"
                );

            },
            2600
        );
}


/*
=========================================================
LEVEL UP MESSAGE
=========================================================
*/

function showPracticeLevelUp(
    oldLevel,
    newLevel,
    title
) {

    const element =
        document.getElementById(
            "practice-level-up"
        );


    if (
        !element
    ) {

        return;
    }


    const levelsGained =
        newLevel
        -
        oldLevel;


    if (
        levelsGained ===
        1
    ) {

        element.textContent =
            `LEVEL UP — You reached Level ${newLevel}: ${title}`;

    } else {

        element.textContent =
            `LEVEL UP — You gained ${levelsGained} levels and reached Level ${newLevel}: ${title}`;
    }


    element.classList.add(
        "show"
    );


    setTimeout(
        () => {

            element.classList.remove(
                "show"
            );

        },
        5000
    );
}


/*
=========================================================
INITIALIZE
=========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const phraseResult =
            await PuzzleGenerator
                .loadPhraseBank(
                    "../data/phrases.json"
                );


        if (
            phraseResult.loaded
        ) {

            

        } else {

            console.warn(
                "Practice phrase bank unavailable."
            );
        }


        setupPracticeEvents();

        populatePracticeCiphers();


        /*
=========================================================
URL CIPHER PRESELECTION
=========================================================
*/

function applyCipherFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const requestedCipher =
        params.get(
            "cipher"
        );


    if (
        !requestedCipher
    ) {

        return;
    }


    const select =
        document.getElementById(
            "practice-cipher"
        );


    const difficultySelect =
        document.getElementById(
            "practice-difficulty"
        );


    /*
    First check current difficulty.
    */

    let exists =
        [
            ...select.options
        ]
        .some(
            option =>
                option.value
                ===
                requestedCipher
        );


    /*
    If the requested cipher isn't available
    at the current difficulty, automatically
    find a difficulty where it is allowed.
    */

    if (
        !exists
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
                            requestedCipher,
                            difficulty
                        )
            );


        if (
            validDifficulty
        ) {

            difficultySelect.value =
                validDifficulty;


            populatePracticeCiphers();


            exists =
                [
                    ...select.options
                ]
                .some(
                    option =>
                        option.value
                        ===
                        requestedCipher
                );
        }
    }


    if (
        exists
    ) {

        select.value =
            requestedCipher;

    } else {

        console.warn(
            `Requested practice cipher not available: ${requestedCipher}`
        );
    }
}


        applyCipherFromURL();

        updateModeDescription();

        updatePracticeStatsUI();

        updateSessionStatsUI();

        MasteryUI.initialize();

        StreakUI.update();

        AchievementUI.initialize();

        resetPracticeDisplay();

        updatePracticeProgressionUI();

            }
        );


/*
=========================================================
EVENTS
=========================================================
*/

function setupPracticeEvents() {

    document.getElementById(
        "practice-mode"
    )
    .addEventListener(
        "change",
        () => {

            updateModeDescription();

            resetPracticeDisplay();

        }
    );


    document.getElementById(
        "practice-difficulty"
    )
    .addEventListener(
        "change",
        () => {

            populatePracticeCiphers();

            resetPracticeDisplay();

        }
    );


    document.getElementById(
        "practice-cipher"
    )
    .addEventListener(
        "change",
        resetPracticeDisplay
    );


    document.getElementById(
        "generate-practice-button"
    )
    .addEventListener(
        "click",
        generatePracticeProblem
    );


    document.getElementById(
        "check-practice-button"
    )
    .addEventListener(
        "click",
        checkPracticeAnswer
    );


    document.getElementById(
        "new-practice-button"
    )
    .addEventListener(
        "click",
        generatePracticeProblem
    );


    document.getElementById(
        "practice-hint-button"
    )
    .addEventListener(
        "click",
        revealPracticeHint
    );


    document.getElementById(
        "reveal-solution-button"
    )
    .addEventListener(
        "click",
        revealPracticeSolution
    );


    document.getElementById(
        "reset-practice-stats-button"
    )
    .addEventListener(
        "click",
        resetPracticeStatistics
    );


    const answer =
        document.getElementById(
            "practice-answer"
        );


    answer.addEventListener(
        "input",
        () => {

            answer.value =
                answer.value
                    .toUpperCase();

        }
    );


    answer.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                checkPracticeAnswer();
            }
        }
    );
}


/*
=========================================================
MODE
=========================================================
*/

function getCurrentMode() {

    return document.getElementById(
        "practice-mode"
    ).value;
}


function getModeConfig() {

    return MODE_CONFIG[
        getCurrentMode()
    ];
}


function updateModeDescription() {

    const config =
        getModeConfig();


    document.getElementById(
        "practice-mode-description"
    ).textContent =
        config.description;
}


/*
=========================================================
CIPHER OPTIONS
=========================================================
*/

function populatePracticeCiphers() {

    const difficulty =
        document.getElementById(
            "practice-difficulty"
        ).value;


    const select =
        document.getElementById(
            "practice-cipher"
        );


    const previous =
        select.value;


    select.innerHTML =
        "";


    const random =
        document.createElement(
            "option"
        );


    random.value =
        "random";


    random.textContent =
        "🎲 Random Cipher";


    select.appendChild(
        random
    );


    const allowed =
        DifficultyEngine
            .getAllowedCiphers(
                difficulty
            );


    allowed.forEach(
        type => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                type;


            const supportedEntry =
                CipherEngine
                    .getSupportedCiphers()
                    .find(
                        item =>
                            item.id
                            ===
                            type
                    );


            option.textContent =
                CipherEngine
                    .getDisplayName(
                        type
                    )
                +
                (
                    supportedEntry?.divisions
                        ?
                        ` • ${supportedEntry.divisions}`
                        :
                        ""
                )
                +
                (
                    supportedEntry?.tier
                    ===
                    "State/National"
                        ?
                        " • STATE/NAT"
                        :
                        ""
                );


            select.appendChild(
                option
            );

        }
    );


    if (
        [
            ...select.options
        ].some(
            option =>
                option.value
                ===
                previous
        )
    ) {

        select.value =
            previous;

    } else {

        select.value =
            "random";
    }
}


/*
=========================================================
GENERATE
=========================================================
*/

function generatePracticeProblem() {

    stopPracticeTimer();


    try {

        const difficulty =
            document.getElementById(
                "practice-difficulty"
            ).value;


        const selected =
            document.getElementById(
                "practice-cipher"
            ).value;


        const options = {

            difficulty

        };


        if (
            selected !==
            "random"
        ) {

            options.type =
                selected;
        }


        currentPractice =
            PuzzleGenerator
                .generate(
                    options
                );


        preparePracticeSession();

        renderPracticePuzzle();

        startPracticeTimer();


    } catch (
        error
    ) {

        console.error(
            "Practice generation error:",
            error
        );


        document.getElementById(
            "practice-challenge"
        )
        .classList.remove(
            "hidden"
        );


        const feedback =
            document.getElementById(
                "practice-feedback"
            );


        feedback.textContent =
            `Could not generate puzzle: ${error.message}`;


        feedback.className =
            "feedback error";
    }
}


/*
=========================================================
SESSION PREP
=========================================================
*/

function preparePracticeSession() {

    practiceGuesses =
        0;


    practiceFinished =
        false;


    revealedPracticeHints =
        [];


    practiceHints =
        DifficultyEngine
            .prepareHints(
                currentPractice
            );


    puzzleStartTime =
        Date.now();


    const answer =
        document.getElementById(
            "practice-answer"
        );


    answer.value =
        "";


    answer.disabled =
        false;


    document.getElementById(
        "practice-feedback"
    ).textContent =
        "";


    document.getElementById(
        "practice-revealed-hints"
    ).innerHTML =
        "";


    document.getElementById(
        "practice-result"
    )
    .classList.add(
        "hidden"
    );


    document.getElementById(
        "practice-solution"
    )
    .classList.add(
        "hidden"
    );


    document.getElementById(
        "reveal-solution-button"
    ).disabled =
        false;


    answer.focus();
}


/*
=========================================================
RENDER
=========================================================
*/

function renderPracticePuzzle() {

    document.getElementById(
        "practice-challenge"
    )
    .classList.remove(
        "hidden"
    );


    const mode =
        getModeConfig();


    document.getElementById(
        "practice-status-title"
    ).textContent =
        `${currentPractice.difficulty} • ${mode.name}`;


    const info =
        DifficultyEngine
            .createInitialInfo({

                ...currentPractice,

                type:
                    currentPractice
                        .cipher_id

            });


    document.getElementById(
        "practice-cipher-name"
    ).textContent =
        info.cipherName
        ||
        "MYSTERY CIPHER";


    renderPracticeChallengeInfo();


    document.getElementById(
        "practice-output"
    ).textContent =
        currentPractice
            .ciphertext;


    updateAttemptsDisplay();

    updatePracticeHintDisplay();

    updatePracticeScorePreview();

    updatePracticeLearnLink();
}


/*
=========================================================
CODEBUSTERS QUESTION INFORMATION
=========================================================
*/

function renderPracticeChallengeInfo() {

    const container =
        document.getElementById(
            "practice-question-info"
        );


    if (
        !container
    ) {

        return;
    }


    container.innerHTML =
        "";


    const rows =
        Array.isArray(
            currentPractice?.challengeInfo
        )
            ?
            currentPractice.challengeInfo
            :
            [];


    if (
        rows.length
        ===
        0
    ) {

        container.classList.add(
            "hidden"
        );

        return;
    }


    rows.forEach(
        row => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "practice-question-info-row";


            const label =
                document.createElement(
                    "div"
                );


            label.className =
                "practice-question-info-label";


            label.textContent =
                String(
                    row.label
                    ||
                    "INFO"
                )
                .toUpperCase();


            const value =
                document.createElement(
                    "div"
                );


            value.className =
                "practice-question-info-value";


            value.textContent =
                String(
                    row.value
                    ??
                    ""
                );


            wrapper.appendChild(
                label
            );


            wrapper.appendChild(
                value
            );


            container.appendChild(
                wrapper
            );

        }
    );


    container.classList.remove(
        "hidden"
    );
}


/*
=========================================================
ATTEMPTS
=========================================================
*/

function updateAttemptsDisplay() {

    const config =
        getModeConfig();


    const remaining =
        Math.max(
            0,
            config.maxGuesses
            -
            practiceGuesses
        );


    const output =
        document.getElementById(
            "practice-attempts"
        );


    if (
        practiceFinished
    ) {

        output.textContent =
            "Challenge complete";

        return;
    }


    output.textContent =
        `${remaining} attempt`
        +
        (
            remaining === 1
                ?
                ""
                :
                "s"
        )
        +
        " remaining";
}


/*
=========================================================
TIMER
=========================================================
*/

function startPracticeTimer() {

    const config =
        getModeConfig();


    const display =
        document.getElementById(
            "practice-timer"
        );


    if (
        config.timeLimit ===
        null
    ) {

        timeRemaining =
            null;


        display.textContent =
            "∞";


        return;
    }


    timeRemaining =
        config.timeLimit;


    updateTimerDisplay();


    timerInterval =
        setInterval(
            () => {

                timeRemaining--;


                updateTimerDisplay();


                if (
                    timeRemaining <=
                    0
                ) {

                    stopPracticeTimer();


                    if (
                        !practiceFinished
                    ) {

                        finishPracticePuzzle(
                            false,
                            "time"
                        );


                        const feedback =
                            document.getElementById(
                                "practice-feedback"
                            );


                        feedback.textContent =
                            "TIME EXPIRED";


                        feedback.className =
                            "feedback error";


                        revealSolutionText();
                    }
                }

            },
            1000
        );
}


function stopPracticeTimer() {

    if (
        timerInterval
    ) {

        clearInterval(
            timerInterval
        );


        timerInterval =
            null;
    }
}


function updateTimerDisplay() {

    const display =
        document.getElementById(
            "practice-timer"
        );


    if (
        timeRemaining ===
        null
    ) {

        display.textContent =
            "∞";

        return;
    }


    const minutes =
        Math.floor(
            timeRemaining / 60
        );


    const seconds =
        String(
            timeRemaining % 60
        )
        .padStart(
            2,
            "0"
        );


    display.textContent =
        `${minutes}:${seconds}`;
}


/*
=========================================================
SCORING
=========================================================
*/

function getCurrentPotentialScore() {

    if (
        !currentPractice
    ) {

        return 0;
    }


    return DifficultyEngine
        .calculateScore({

            difficulty:
                currentPractice
                    .difficulty,

            guessesUsed:
                practiceGuesses
                +
                1,

            hintsUsed:
                revealedPracticeHints

        });
}


function calculateModeBonus(
    solved
) {

    if (
        !solved
    ) {

        return 0;
    }


    const mode =
        getCurrentMode();


    if (
        mode ===
        "competition"
    ) {

        return (
            revealedPracticeHints
                .length
            ===
            0
        )
            ?
            25
            :
            0;
    }


    if (
        mode ===
        "speed"
    ) {

        const config =
            getModeConfig();


        const fraction =
            Math.max(
                0,
                timeRemaining
            )
            /
            config.timeLimit;


        return Math.round(
            fraction * 50
        );
    }


    return 0;
}


function updatePracticeScorePreview() {

    if (
        practiceFinished
    ) {

        return;
    }


    document.getElementById(
        "practice-score-preview"
    ).textContent =
        getCurrentPotentialScore();
}


/*
=========================================================
CHECK ANSWER
=========================================================
*/

function checkPracticeAnswer() {

    if (
        !currentPractice
        ||
        practiceFinished
    ) {

        return;
    }


    const answerBox =
        document.getElementById(
            "practice-answer"
        );


    const answer =
        normalizeAnswer(
            answerBox.value
        );


    const correct =
        normalizeAnswer(
            currentPractice.solution
        );


    const feedback =
        document.getElementById(
            "practice-feedback"
        );


    if (!answer) {

        feedback.textContent =
            "Enter an answer first.";


        feedback.className =
            "feedback error";

        return;
    }


    practiceGuesses++;


    if (
        answer ===
        correct
    ) {

        finishPracticePuzzle(
            true,
            "solved"
        );


        feedback.textContent =
            "✓ CORRECT — CIPHER CRACKED";


        feedback.className =
            "feedback success";

        return;
    }


    const remaining =
        getModeConfig()
            .maxGuesses
        -
        practiceGuesses;


    if (
        remaining <=
        0
    ) {

        finishPracticePuzzle(
            false,
            "attempts"
        );


        feedback.textContent =
            "OUT OF ATTEMPTS";


        feedback.className =
            "feedback error";


        revealSolutionText();

        return;
    }


    feedback.textContent =
        `Incorrect. ${remaining} attempt`
        +
        (
            remaining === 1
                ?
                ""
                :
                "s"
        )
        +
        " remaining.";


    feedback.className =
        "feedback error";


    answerBox.select();


    updateAttemptsDisplay();

    updatePracticeScorePreview();
}


/*
=========================================================
FINISH
=========================================================
*/

function finishPracticePuzzle(
    solved,
    reason
) {

    if (
        practiceFinished
    ) {

        return;
    }


    practiceFinished =
        true;


    stopPracticeTimer();


    const baseResult =
        DifficultyEngine
            .createResult({

                difficulty:
                    currentPractice
                        .difficulty,

                solved,

                guessesUsed:
                    Math.max(
                        practiceGuesses,
                        1
                    ),

                hintsUsed:
                    revealedPracticeHints

            });


    const bonus =
        calculateModeBonus(
            solved
        );


    const finalScore =
        baseResult.score
        +
        bonus;


    const elapsedSeconds =
        Math.max(
            0,
            Math.round(
                (
                    Date.now()
                    -
                    puzzleStartTime
                )
                /
                1000
            )
        );


    const result = {

    ...baseResult,

    score:
        finalScore,

    baseScoreEarned:
        baseResult.score,

    modeBonus:
        bonus,

    mode:
        getCurrentMode(),

    cipher:
        currentPractice
            .cipher_id,

    elapsedSeconds,

    reason

};


/*
Calculate the XP this result will earn.

The same fields are later stored in activityHistory,
so the progression calculation remains consistent.
*/

result.xpEarned =
    ProgressionEngine
        .calculateActivityXP({

            source:
                "practice",

            cipher:
                result.cipher,

            difficulty:
                currentPractice
                    .difficulty,

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
                result.mode

        });


    document.getElementById(
        "practice-answer"
    ).disabled =
        true;


    document.getElementById(
        "practice-hint-button"
    ).disabled =
        true;


    document.getElementById(
        "reveal-solution-button"
    ).disabled =
        solved;


    displayPracticeResult(
        result
    );


    recordPracticeResult(
        result
    );


    /*
Activity has now been stored, so recalculate
total XP and level.
*/

updatePracticeProgressionUI({

    xpEarned:
        result.xpEarned

});


MasteryUI.update();


StreakUI.update();


AchievementUI.syncAndNotify();


/*
Automatically save the newly recorded activity
to Supabase when the user is signed in.

Guests simply skip this.
*/

if (
    typeof CloudSync !==
    "undefined"
) {

    CloudSync.syncNow({

        silent:
            true

    });
}


updateAttemptsDisplay();


    document.getElementById(
        "practice-score-preview"
    ).textContent =
        result.score;
}


/*
=========================================================
RESULT DISPLAY
=========================================================
*/

function displayPracticeResult(
    result
) {

    const box =
        document.getElementById(
            "practice-result"
        );


    box.classList.remove(
        "hidden"
    );


    document.getElementById(
        "practice-result-score"
    ).textContent =
        `${result.score} pts`;


    let detail;


    if (
        result.solved
    ) {

        detail =
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
            ` • ${result.elapsedSeconds}s`;


        if (
            result.modeBonus >
            0
        ) {

            detail +=
                ` • +${result.modeBonus} mode bonus`;
        }

    } else {

        detail =
            `Unsolved • ${result.elapsedSeconds}s`;
    }

detail +=
    ` • +${result.xpEarned} XP`;

    document.getElementById(
        "practice-result-detail"
    ).textContent =
        detail;
}


/*
=========================================================
HINTS
=========================================================
*/

function revealPracticeHint() {

    if (
        !currentPractice
        ||
        practiceFinished
    ) {

        return;
    }


    if (
        !getModeConfig()
            .hints
    ) {

        return;
    }


    const index =
        revealedPracticeHints
            .length;


    if (
        index >=
        practiceHints.length
    ) {

        return;
    }


    const hint =
        DifficultyEngine
            .revealHint(
                practiceHints,
                index
            );


    if (!hint) {

        return;
    }


    revealedPracticeHints.push(
        index
    );


    renderPracticeHints();

    updatePracticeHintDisplay();

    updatePracticeScorePreview();
}


function renderPracticeHints() {

    const container =
        document.getElementById(
            "practice-revealed-hints"
        );


    container.innerHTML =
        "";


    revealedPracticeHints.forEach(
        index => {

            const hint =
                practiceHints[
                    index
                ];


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "practice-hint-card";


            card.innerHTML =
                `
                <div class="practice-hint-number">
                    HINT ${index + 1} • -${hint.penalty} POINTS
                </div>

                <div class="practice-hint-title">
                    ${escapePracticeHTML(
                        hint.title
                        ||
                        `Hint ${index + 1}`
                    )}
                </div>

                <p class="practice-hint-text">
                    ${escapePracticeHTML(
                        hint.text
                    )}
                </p>
                `;


            container.appendChild(
                card
            );

        }
    );
}


function updatePracticeHintDisplay() {

    const config =
        getModeConfig();


    const button =
        document.getElementById(
            "practice-hint-button"
        );


    const counter =
        document.getElementById(
            "practice-hint-counter"
        );


    const cost =
        document.getElementById(
            "practice-hint-cost"
        );


    const used =
        revealedPracticeHints
            .length;


    counter.textContent =
        `${used} hint`
        +
        (
            used === 1
                ?
                ""
                :
                "s"
        )
        +
        " used";


    if (
        !config.hints
    ) {

        button.disabled =
            true;


        button.textContent =
            "Hints Disabled";


        cost.textContent =
            "Speed mode does not allow hints.";

        return;
    }


    if (
        practiceFinished
    ) {

        button.disabled =
            true;


        return;
    }


    if (
        used >=
        practiceHints.length
    ) {

        button.disabled =
            true;


        button.textContent =
            "All Hints Revealed";


        cost.textContent =
            "";

        return;
    }


    button.disabled =
        false;


    button.textContent =
        `Reveal Hint ${used + 1}`;


    cost.textContent =
        `Next hint costs ${practiceHints[used].penalty} points.`;
}


/*
=========================================================
SOLUTION
=========================================================
*/

function revealPracticeSolution() {

    if (
        !currentPractice
    ) {

        return;
    }


    if (
        !practiceFinished
    ) {

        finishPracticePuzzle(
            false,
            "revealed"
        );


        document.getElementById(
            "practice-feedback"
        ).textContent =
            "Solution revealed — challenge ended.";


        document.getElementById(
            "practice-feedback"
        ).className =
            "feedback error";
    }


    revealSolutionText();
}


function revealSolutionText() {

    document.getElementById(
        "practice-solution-text"
    ).textContent =
        currentPractice.solution;


    document.getElementById(
        "practice-solution"
    )
    .classList.remove(
        "hidden"
    );
}


/*
=========================================================
LEARN LINKS
=========================================================
*/

function updatePracticeLearnLink() {

    const type =
        currentPractice
            .cipher_id;


    const pages = {

        caesar:
            "caesar.html",

        atbash:
            "atbash.html",

        affine:
            "affine.html",

        railfence:
            "railfence.html",

        hill:
            "hill.html"

    };


    const link =
        document.getElementById(
            "practice-learn-link"
        );


    if (
        pages[
            type
        ]
    ) {

        link.href =
            `../learn/${pages[type]}`;


        link.textContent =
            `Learn ${CipherEngine.getDisplayName(type)} →`;

    } else {

        link.href =
            "../learn/index.html";


        link.textContent =
            `Open Learn Hub for ${CipherEngine.getDisplayName(type)} →`;
    }
}


/*
=========================================================
STORE PRACTICE RESULT
=========================================================
*/

function recordPracticeResult(
    result
) {

    const stats =
        loadPracticeStats();


    stats.totalPlayed++;


    if (
        result.solved
    ) {

        stats.totalSolved++;

        stats.totalScore +=
            result.score;


        stats.bestScore =
            Math.max(
                stats.bestScore,
                result.score
            );


        stats.totalHints +=
            result.hintCount;


        if (
            result.elapsedSeconds >
            0
        ) {

            stats.totalSolveTime +=
                result.elapsedSeconds;


            stats.timedSolves++;
        }
    }


    const cipher =
        result.cipher;


    if (
        !stats.byCipher[
            cipher
        ]
    ) {

        stats.byCipher[
            cipher
        ] = {

            played: 0,

            solved: 0,

            totalScore: 0,

            bestScore: 0

        };
    }


    const cipherStats =
        stats.byCipher[
            cipher
        ];


    cipherStats.played++;


    if (
        result.solved
    ) {

        cipherStats.solved++;

        cipherStats.totalScore +=
            result.score;


        cipherStats.bestScore =
            Math.max(
                cipherStats.bestScore,
                result.score
            );
    }


    stats.recent.unshift({

        cipher:
            result.cipher,

        difficulty:
            currentPractice
                .difficulty,

        mode:
            result.mode,

        solved:
            result.solved,

        score:
            result.score,

        guesses:
            result.guessesUsed,

        hints:
            result.hintCount,

        seconds:
            result.elapsedSeconds,

        timestamp:
            new Date()
                .toISOString()

    });


    stats.recent =
        stats.recent.slice(
            0,
            20
        );


    savePracticeStats(
        stats
    );


    /*
Central activity history.
*/

recordActivity({

    source:
        "practice",

    cipher:
        result.cipher,

    difficulty:
        currentPractice
            .difficulty,

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
        result.mode,

    metadata: {

        reason:
            result.reason,

        baseScore:
            result.baseScoreEarned,

        modeBonus:
            result.modeBonus,
        
        xpEarned:
            result.xpEarned,

    }

});


    sessionStats.played++;


    if (
        result.solved
    ) {

        sessionStats.solved++;

        sessionStats.score +=
            result.score;
    }


    updatePracticeStatsUI();

    updateSessionStatsUI();
}


/*
=========================================================
STATS UI
=========================================================
*/

function updatePracticeStatsUI() {

    const stats =
        loadPracticeStats();


    const rate =
        stats.totalPlayed ===
        0
            ?
            0
            :
            Math.round(
                (
                    stats.totalSolved
                    /
                    stats.totalPlayed
                )
                *
                100
            );


    setPracticeText(
        "practice-stat-played",
        stats.totalPlayed
    );


    setPracticeText(
        "practice-stat-solve-rate",
        `${rate}%`
    );


    setPracticeText(
        "practice-stat-score",
        stats.totalScore
    );


    setPracticeText(
        "practice-stat-best",
        stats.bestScore
    );


    renderCipherStats(
        stats
    );


    renderPracticeHistory(
        stats
    );
}


function updateSessionStatsUI() {

    setPracticeText(
        "session-played",
        sessionStats.played
    );


    setPracticeText(
        "session-solved",
        sessionStats.solved
    );


    setPracticeText(
        "session-score",
        sessionStats.score
    );
}


/*
=========================================================
CIPHER STATS
=========================================================
*/

function renderCipherStats(
    stats
) {

    const container =
        document.getElementById(
            "practice-cipher-stats"
        );


    container.innerHTML =
        "";


    const entries =
        Object.entries(
            stats.byCipher
        )
        .sort(
            (
                a,
                b
            ) =>
                b[1].played
                -
                a[1].played
        );


    if (
        entries.length ===
        0
    ) {

        container.textContent =
            "No practice data yet.";


        container.className =
            "practice-muted";

        return;
    }


    entries.forEach(
        (
            [
                cipher,
                data
            ]
        ) => {

            const rate =
                data.played
                ===
                0
                    ?
                    0
                    :
                    Math.round(
                        (
                            data.solved
                            /
                            data.played
                        )
                        *
                        100
                    );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "cipher-performance-row";


            row.innerHTML =
                `
                <strong>
                    ${escapePracticeHTML(
                        CipherEngine
                            .getDisplayName(
                                cipher
                            )
                    )}
                </strong>

                <span class="practice-muted">
                    ${data.solved}/${data.played}
                    • ${rate}%
                </span>

                <strong>
                    ${data.bestScore} pts
                </strong>
                `;


            container.appendChild(
                row
            );

        }
    );
}


/*
=========================================================
HISTORY
=========================================================
*/

function renderPracticeHistory(
    stats
) {

    const container =
        document.getElementById(
            "practice-history"
        );


    container.innerHTML =
        "";


    if (
        !stats.recent.length
    ) {

        container.textContent =
            "No recent practice yet.";


        container.className =
            "practice-muted";

        return;
    }


    stats.recent
        .slice(
            0,
            10
        )
        .forEach(
            entry => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "practice-history-row";


                row.innerHTML =
                    `
                    <strong>
                        ${escapePracticeHTML(
                            CipherEngine
                                .getDisplayName(
                                    entry.cipher
                                )
                        )}
                    </strong>

                    <span class="practice-muted">
                        ${entry.difficulty}
                        •
                        ${capitalizePractice(
                            entry.mode
                        )}
                    </span>

                    <span>
                        ${entry.solved ? "✓" : "✕"}
                    </span>

                    <strong>
                        ${entry.score} pts
                    </strong>
                    `;


                container.appendChild(
                    row
                );

            }
        );
}


/*
=========================================================
RESET STATS
=========================================================
*/

function resetPracticeStatistics() {

    const confirmed =
        confirm(
            "Reset all Practice statistics? Daily challenge statistics will not be affected."
        );


    if (
        !confirmed
    ) {

        return;
    }


    resetPracticeStats();


    sessionStats.played =
        0;


    sessionStats.solved =
        0;


    sessionStats.score =
        0;


    updatePracticeStatsUI();

    updateSessionStatsUI();
}


/*
=========================================================
RESET CHALLENGE
=========================================================
*/

function resetPracticeDisplay() {

    stopPracticeTimer();


    currentPractice =
        null;


    practiceHints =
        [];


    revealedPracticeHints =
        [];


    practiceGuesses =
        0;


    practiceFinished =
        false;


    document.getElementById(
        "practice-challenge"
    )
    .classList.add(
        "hidden"
    );


    const questionInfo =
        document.getElementById(
            "practice-question-info"
        );


    if (
        questionInfo
    ) {

        questionInfo.innerHTML =
            "";

        questionInfo.classList.add(
            "hidden"
        );
    }
}



/*
=========================================================
HELPERS
=========================================================
*/

function setPracticeText(
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


function escapePracticeHTML(
    text
) {

    return String(
        text ?? ""
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


function capitalizePractice(
    text
) {

    const value =
        String(
            text || ""
        );


    return value
        .charAt(0)
        .toUpperCase()
        +
        value.slice(1);
}