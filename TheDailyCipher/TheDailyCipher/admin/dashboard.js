/*
=========================================================
THE DAILY CIPHER
Admin Dashboard v1.0

Requires:
- cipherEngine.js
- difficultyEngine.js
- puzzleGenerator.js
=========================================================
*/


let currentAdminPuzzle =
    null;


let currentDailySet =
    null;


/*
Multi-day generated schedule.
*/

let currentSchedule =
    null;


/*
=========================================================
INITIALIZATION
=========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
        Load external plaintext database
        before allowing puzzle generation.
        */

        const phraseResult =
            await PuzzleGenerator
                .loadPhraseBank(
                    "../data/phrases.json"
                );


        if (
            !phraseResult.loaded
        ) {

            console.warn(
                "External phrase bank unavailable. " +
                "Fallback phrases will be used."
            );

        } else {

            console.info(
                `Admin loaded ${phraseResult.count} reviewed phrases.`
            );
        }


        setupDefaultDate();

        populateCipherOptions();

        setupEventListeners();

    }
);


/*
=========================================================
DEFAULT DATE
=========================================================
*/

function setupDefaultDate() {

    const input =
        document.getElementById(
            "admin-date"
        );


    if (!input) {
        return;
    }


    /*
    Default to tomorrow.
    */

    const tomorrow =
        new Date();


    tomorrow.setDate(
        tomorrow.getDate() + 1
    );


    const year =
        tomorrow.getFullYear();


    const month =
        String(
            tomorrow.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            tomorrow.getDate()
        )
        .padStart(
            2,
            "0"
        );


    input.value =
        `${year}-${month}-${day}`;

         /*
    Also use tomorrow as the
    default schedule start date.
    */

    const scheduleInput =
        document.getElementById(
            "schedule-start-date"
        );


    if (
        scheduleInput
    ) {

        scheduleInput.value =
            `${year}-${month}-${day}`;
    }
}


/*
=========================================================
CIPHER DROPDOWN
=========================================================
*/

function populateCipherOptions() {

    const difficulty =
        document.getElementById(
            "admin-difficulty"
        ).value;


    const select =
        document.getElementById(
            "admin-cipher"
        );


    if (!select) {
        return;
    }


    select.innerHTML =
        "";


    const allowed =
        DifficultyEngine
            .getAllowedCiphers(
                difficulty
            );


    allowed.forEach(
        cipherID => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                cipherID;


            option.textContent =
                CipherEngine
                    .getDisplayName(
                        cipherID
                    );


            select.appendChild(
                option
            );

        }
    );
}


/*
=========================================================
PLAINTEXT MODE
=========================================================
*/

function updatePlaintextMode() {

    const mode =
        document.getElementById(
            "admin-plaintext-mode"
        ).value;


    const field =
        document.getElementById(
            "custom-plaintext-field"
        );


    if (
        mode === "custom"
    ) {

        field.classList.remove(
            "hidden"
        );

    } else {

        field.classList.add(
            "hidden"
        );
    }
}

/*
=========================================================
DATE HELPERS
=========================================================
*/

function addDaysToDate(
    dateString,
    numberOfDays
) {

    const date =
        new Date(
            `${dateString}T12:00:00`
        );


    date.setDate(
        date.getDate()
        +
        numberOfDays
    );


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
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

/*
=========================================================
GENERATE SINGLE PUZZLE
=========================================================
*/

function generateAdminPuzzle() {

    try {

        const date =
            document.getElementById(
                "admin-date"
            ).value;


        const difficulty =
            document.getElementById(
                "admin-difficulty"
            ).value;


        const type =
            document.getElementById(
                "admin-cipher"
            ).value;


        const mode =
            document.getElementById(
                "admin-plaintext-mode"
            ).value;


        const options = {

            date,

            difficulty,

            type

        };


        /*
        Custom plaintext.
        */

        if (
            mode === "custom"
        ) {

            const plaintext =
                document.getElementById(
                    "admin-plaintext"
                )
                .value
                .trim();


            if (!plaintext) {

                alert(
                    "Enter custom plaintext first."
                );

                return;
            }


            options.plaintext =
                plaintext;
        }


        currentAdminPuzzle =
            PuzzleGenerator
                .generate(
                    options
                );


        showPuzzlePreview(
            currentAdminPuzzle
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            `Generation failed: ${error.message}`
        );
    }
}


/*
=========================================================
PREVIEW SINGLE PUZZLE
=========================================================
*/

function showPuzzlePreview(
    puzzle
) {

    const preview =
        document.getElementById(
            "admin-preview"
        );


    preview.classList.remove(
        "hidden"
    );


    setText(
        "preview-difficulty",
        puzzle.difficulty
    );


    setText(
        "preview-cipher",
        puzzle.cipher_type
    );


    setText(
        "preview-plaintext",
        puzzle.plaintext
    );


    setText(
        "preview-ciphertext",
        puzzle.ciphertext
    );


    setText(
        "preview-id",
        puzzle.id
    );


    setText(
        "preview-parameters",
        JSON.stringify(
            puzzle.parameters
        )
    );


    renderHints(
        puzzle.hints
    );


    validateCurrentPuzzle();


    document.getElementById(
        "json-output"
    ).textContent =
        PuzzleGenerator
            .toJSON(
                puzzle
            );
}


/*
=========================================================
HINT PREVIEW
=========================================================
*/

function renderHints(
    hints
) {

    const container =
        document.getElementById(
            "preview-hints"
        );


    container.innerHTML =
        "";


    if (
        !Array.isArray(
            hints
        )
        ||
        hints.length === 0
    ) {

        container.textContent =
            "No hints generated.";

        return;
    }


    hints.forEach(
        (
            hint,
            index
        ) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "hint-preview";


            const title =
                hint.title
                ||
                `Hint ${index + 1}`;


            card.textContent =
                `${index + 1}. ${title}: ${hint.text}`;


            container.appendChild(
                card
            );

        }
    );
}


/*
=========================================================
VALIDATION
=========================================================
*/

function validateCurrentPuzzle() {

    if (
        !currentAdminPuzzle
    ) {
        return;
    }


    const result =
        PuzzleGenerator
            .validatePuzzle(
                currentAdminPuzzle
            );


    const box =
        document.getElementById(
            "admin-validation"
        );


    box.classList.remove(
        "valid",
        "invalid"
    );


    if (
        result.valid
    ) {

        box.classList.add(
            "valid"
        );


        box.textContent =
            "✓ Puzzle passed automatic validation.";

    } else {

        box.classList.add(
            "invalid"
        );


        box.textContent =
            "Validation failed: "
            +
            result.errors.join(
                " | "
            );
    }
}


/*
=========================================================
REGENERATE SINGLE
=========================================================
*/

function regeneratePuzzle() {

    generateAdminPuzzle();
}


/*
=========================================================
GENERATE FULL DAILY SET
=========================================================
*/

function generateAdminDailySet() {

    try {

        const date =
            document.getElementById(
                "admin-date"
            ).value;


        currentDailySet =
            PuzzleGenerator
                .generateDailySet({

                    date

                });


        renderDailySet(
            currentDailySet
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            `Daily set generation failed: ${error.message}`
        );
    }
}


/*
=========================================================
DAILY SET PREVIEW
=========================================================
*/

function renderDailySet(
    puzzles
) {

    const section =
        document.getElementById(
            "daily-set-preview"
        );


    const summary =
        document.getElementById(
            "daily-set-summary"
        );


    section.classList.remove(
        "hidden"
    );


    summary.innerHTML =
        "";


    puzzles.forEach(
        puzzle => {

            const validation =
                PuzzleGenerator
                    .validatePuzzle(
                        puzzle
                    );


            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "preview-item";


            wrapper.style.marginBottom =
                "12px";


            const title =
                document.createElement(
                    "strong"
                );


            title.textContent =
                `${puzzle.difficulty} — ${puzzle.cipher_type}`;


            const ciphertext =
                document.createElement(
                    "div"
                );


            ciphertext.style.marginTop =
                "8px";


            ciphertext.style.fontFamily =
                "monospace";


            ciphertext.textContent =
                puzzle.ciphertext;


            const status =
                document.createElement(
                    "div"
                );


            status.style.marginTop =
                "8px";


            status.style.fontSize =
                "12px";


            status.textContent =
                validation.valid
                    ? "✓ Valid"
                    : "⚠ Invalid";


            wrapper.appendChild(
                title
            );


            wrapper.appendChild(
                ciphertext
            );


            wrapper.appendChild(
                status
            );


            summary.appendChild(
                wrapper
            );

        }
    );


    document.getElementById(
        "daily-set-json"
    ).textContent =
        PuzzleGenerator
            .dailySetToJSON(
                puzzles
            );
}

/*
=========================================================
GENERATE MULTI-DAY SCHEDULE
=========================================================
*/

function generateSchedule() {

    try {

        const startDate =
            document.getElementById(
                "schedule-start-date"
            ).value;


        const numberOfDays =
            Number(
                document.getElementById(
                    "schedule-days"
                ).value
            );


        if (
            !startDate
        ) {

            alert(
                "Choose a schedule start date."
            );

            return;
        }


        if (
            !Number.isInteger(
                numberOfDays
            )
            ||
            numberOfDays < 1
            ||
            numberOfDays > 365
        ) {

            alert(
                "Number of days must be between 1 and 365."
            );

            return;
        }


        const schedule =
            [];


        for (
            let offset = 0;
            offset < numberOfDays;
            offset++
        ) {

            const date =
                addDaysToDate(
                    startDate,
                    offset
                );


            const puzzles =
                PuzzleGenerator
                    .generateDailySet({

                        date

                    });


            /*
            Validate every puzzle before
            adding the day to the schedule.
            */

            const validations =
                puzzles.map(
                    puzzle =>
                        PuzzleGenerator
                            .validatePuzzle(
                                puzzle
                            )
                );


            schedule.push({

                date,

                puzzles,

                valid:
                    validations.every(
                        result =>
                            result.valid
                    ),

                validations

            });
        }


        currentSchedule =
            schedule;


        renderSchedule(
            currentSchedule
        );


    } catch (error) {

        console.error(
            "Schedule generation error:",
            error
        );


        alert(
            `Schedule generation failed: ${error.message}`
        );
    }
}


/*
=========================================================
RENDER SCHEDULE
=========================================================
*/

function renderSchedule(
    schedule
) {

    const preview =
        document.getElementById(
            "schedule-preview"
        );


    const summary =
        document.getElementById(
            "schedule-summary"
        );


    const title =
        document.getElementById(
            "schedule-title"
        );


    preview.classList.remove(
        "hidden"
    );


    summary.innerHTML =
        "";


    const totalPuzzles =
        schedule.length * 3;


    title.textContent =
        `${schedule.length} Days • ${totalPuzzles} Puzzles`;


    schedule.forEach(
        day => {

            const dayCard =
                document.createElement(
                    "div"
                );


            dayCard.className =
                "schedule-day";


            /*
            Header.
            */

            const header =
                document.createElement(
                    "div"
                );


            header.className =
                "schedule-day-header";


            const date =
                document.createElement(
                    "div"
                );


            date.className =
                "schedule-date";


            date.textContent =
                day.date;


            const status =
                document.createElement(
                    "div"
                );


            status.className =
                day.valid
                    ? "schedule-status"
                    : "schedule-status schedule-invalid";


            status.textContent =
                day.valid
                    ? "✓ ALL VALID"
                    : "⚠ VALIDATION ERROR";


            header.appendChild(
                date
            );


            header.appendChild(
                status
            );


            /*
            Puzzle cards.
            */

            const puzzleGrid =
                document.createElement(
                    "div"
                );


            puzzleGrid.className =
                "schedule-puzzles";


            day.puzzles.forEach(
                puzzle => {

                    const puzzleCard =
                        document.createElement(
                            "div"
                        );


                    puzzleCard.className =
                        "schedule-puzzle";


                    const difficulty =
                        document.createElement(
                            "div"
                        );


                    difficulty.className =
                        "schedule-puzzle-difficulty";


                    difficulty.textContent =
                        puzzle.difficulty
                            .toUpperCase();


                    const cipher =
                        document.createElement(
                            "div"
                        );


                    cipher.className =
                        "schedule-puzzle-cipher";


                    cipher.textContent =
                        puzzle.cipher_type;


                    puzzleCard.appendChild(
                        difficulty
                    );


                    puzzleCard.appendChild(
                        cipher
                    );


                    puzzleGrid.appendChild(
                        puzzleCard
                    );

                }
            );


            dayCard.appendChild(
                header
            );


            dayCard.appendChild(
                puzzleGrid
            );


            summary.appendChild(
                dayCard
            );

        }
    );


    /*
    Export only puzzle objects,
    not internal validation information.
    */

    const flattened =
        flattenSchedule(
            schedule
        );


    document.getElementById(
        "schedule-json"
    ).textContent =
        JSON.stringify(
            flattened,
            null,
            4
        );
}


/*
=========================================================
FLATTEN SCHEDULE
=========================================================
*/

function flattenSchedule(
    schedule
) {

    return schedule
        .flatMap(
            day =>
                day.puzzles
        );
}


/*
=========================================================
COPY SCHEDULE JSON
=========================================================
*/

async function copyScheduleJSON() {

    if (
        !currentSchedule
        ||
        currentSchedule.length === 0
    ) {

        alert(
            "Generate a schedule first."
        );

        return;
    }


    const flattened =
        flattenSchedule(
            currentSchedule
        );


    const json =
        JSON.stringify(
            flattened,
            null,
            4
        );


    await copyText(
        json
    );


    alert(
        `${flattened.length} puzzles copied as JSON.`
    );
}


/*
=========================================================
CLEAR SCHEDULE
=========================================================
*/

function clearSchedule() {

    currentSchedule =
        null;


    const preview =
        document.getElementById(
            "schedule-preview"
        );


    if (
        preview
    ) {

        preview.classList.add(
            "hidden"
        );
    }


    const summary =
        document.getElementById(
            "schedule-summary"
        );


    if (
        summary
    ) {

        summary.innerHTML =
            "";
    }


    const json =
        document.getElementById(
            "schedule-json"
        );


    if (
        json
    ) {

        json.textContent =
            "";
    }
}

/*
=========================================================
COPY SINGLE JSON
=========================================================
*/

async function copyPuzzleJSON() {

    if (
        !currentAdminPuzzle
    ) {

        alert(
            "Generate a puzzle first."
        );

        return;
    }


    const json =
        PuzzleGenerator
            .toJSON(
                currentAdminPuzzle
            );


    await copyText(
        json
    );


    alert(
        "Puzzle JSON copied."
    );
}


/*
=========================================================
COPY DAILY SET
=========================================================
*/

async function copyDailySetJSON() {

    if (
        !currentDailySet
    ) {

        alert(
            "Generate a daily set first."
        );

        return;
    }


    const json =
        PuzzleGenerator
            .dailySetToJSON(
                currentDailySet
            );


    await copyText(
        json
    );


    alert(
        "Daily set JSON copied."
    );
}


/*
=========================================================
CLIPBOARD
=========================================================
*/

async function copyText(
    text
) {

    try {

        await navigator
            .clipboard
            .writeText(
                text
            );


    } catch (error) {

        console.error(
            "Clipboard error:",
            error
        );


        throw error;
    }
}


/*
=========================================================
CLEAR
=========================================================
*/

function clearAdmin() {

    currentAdminPuzzle =
    null;


currentDailySet =
    null;


currentSchedule =
    null;


    document.getElementById(
        "admin-preview"
    )
    .classList.add(
        "hidden"
    );


    document.getElementById(
        "daily-set-preview"
    )
    .classList.add(
        "hidden"
    );


    document.getElementById(
        "admin-plaintext"
    ).value =
        "";
    
        const schedulePreview =
        document.getElementById(
            "schedule-preview"
        );


    if (
        schedulePreview
    ) {

        schedulePreview
            .classList
            .add(
                "hidden"
            );
    }
}


/*
=========================================================
GENERIC TEXT HELPER
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
EVENT LISTENERS
=========================================================
*/

function setupEventListeners() {

    const difficulty =
        document.getElementById(
            "admin-difficulty"
        );


    const mode =
        document.getElementById(
            "admin-plaintext-mode"
        );


    const generateButton =
        document.getElementById(
            "generate-puzzle-button"
        );


    const setButton =
        document.getElementById(
            "generate-set-button"
        );


            const scheduleButton =
        document.getElementById(
            "generate-schedule-button"
        );


    const regenerateScheduleButton =
        document.getElementById(
            "regenerate-schedule-button"
        );


    const copyScheduleButton =
        document.getElementById(
            "copy-schedule-button"
        );


    const clearScheduleButton =
        document.getElementById(
            "clear-schedule-button"
        );


    const clearButton =
        document.getElementById(
            "clear-admin-button"
        );


    const regenerateButton =
        document.getElementById(
            "regenerate-button"
        );


    const regenerateSetButton =
        document.getElementById(
            "regenerate-set-button"
        );


    const validateButton =
        document.getElementById(
            "validate-button"
        );


    const copyButton =
        document.getElementById(
            "copy-json-button"
        );


    const copySetButton =
        document.getElementById(
            "copy-set-json-button"
        );


    difficulty.addEventListener(
        "change",
        populateCipherOptions
    );


    mode.addEventListener(
        "change",
        updatePlaintextMode
    );


    generateButton.addEventListener(
        "click",
        generateAdminPuzzle
    );


    setButton.addEventListener(
        "click",
        generateAdminDailySet
    );


    clearButton.addEventListener(
        "click",
        clearAdmin
    );


    regenerateButton.addEventListener(
        "click",
        regeneratePuzzle
    );


    regenerateSetButton.addEventListener(
        "click",
        generateAdminDailySet
    );


    validateButton.addEventListener(
        "click",
        validateCurrentPuzzle
    );


    copyButton.addEventListener(
        "click",
        copyPuzzleJSON
    );


    copySetButton.addEventListener(
        "click",
        copyDailySetJSON
    );


        scheduleButton.addEventListener(
        "click",
        generateSchedule
    );


    regenerateScheduleButton
        .addEventListener(
            "click",
            generateSchedule
        );


    copyScheduleButton
        .addEventListener(
            "click",
            copyScheduleJSON
        );


    clearScheduleButton
        .addEventListener(
            "click",
            clearSchedule
        );
}