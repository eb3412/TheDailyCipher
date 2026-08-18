/*
=========================================================
THE DAILY CIPHER
ARISTOCRAT / PATRISTOCRAT CRYPTANALYSIS TRAINER
=========================================================
*/


const SubstitutionTrainer = (() => {


    const ALPHABET =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


    const TRAINING_PHRASES =
        [

            "THE SECRET MESSAGE HIDES BETWEEN THE LINES",

            "PATTERN RECOGNITION IS A POWERFUL CODEBREAKING TOOL",

            "GOOD SOLVERS TEST IDEAS AND LOOK FOR CONTRADICTIONS",

            "FREQUENCY ANALYSIS PROVIDES CLUES BUT NOT CERTAINTY",

            "REPEATED LETTERS CAN REVEAL IMPORTANT WORD PATTERNS",

            "LANGUAGE STRUCTURE GIVES CODEBREAKERS USEFUL EVIDENCE"

        ];


    let mode =
        null;


    let plaintext =
        "";


    let ciphertext =
        "";


    let substitutionAlphabet =
        "";


    let mapping =
        {};


    let selectedCipherLetter =
        null;


    /*
    =====================================================
    INITIALIZE
    =====================================================
    */

    function initialize(
        guide
    ) {

        if (
            !guide
            ||
            ![
                "aristocrat",
                "patristocrat"
            ]
            .includes(
                guide.id
            )
        ) {

            return;
        }


        mode =
            guide.id;


        const section =
            document.getElementById(
                "advanced-teaching-section"
            );


        const container =
            document.getElementById(
                "teaching-module"
            );


        if (
            !section
            ||
            !container
        ) {

            return;
        }


        section.classList.remove(
            "hidden"
        );


        document.getElementById(
            "teaching-title"
        ).textContent =
            mode ===
            "aristocrat"
                ?
                "Solve an Aristocrat Cryptogram"
                :
                "Solve a Patristocrat Cryptogram";


        document.getElementById(
            "teaching-description"
        ).textContent =
            mode ===
            "aristocrat"

                ?

                "This trainer focuses on cryptanalysis rather than encryption. Use frequency, word structure, repeated letters, and tentative substitutions to gradually reconstruct the plaintext."

                :

                "Patristocrat removes the original word boundaries, so many easy word clues disappear. Use frequency, repeated sequences, and consistent substitution guesses to reconstruct both the letters and eventually the spacing.";


        container.innerHTML =
            createHTML();


        setupEvents();

        newPuzzle();

    }


    /*
    =====================================================
    HTML
    =====================================================
    */

    function createHTML() {

        return `

        <div class="crypto-trainer">


            <!-- ========================================
                 PUZZLE
            ========================================= -->

            <div class="crypto-stage">

                <div class="crypto-stage-number">
                    TRAINING PUZZLE
                </div>

                <h3>
                    Start with the ciphertext
                </h3>

                <p class="crypto-stage-description">
                    Every ciphertext letter always
                    represents the same plaintext letter.
                    Your job is to gradually discover that
                    substitution.
                </p>


                <div class="crypto-rule">
                    One ciphertext letter
                    = one consistent plaintext letter
                </div>


                <div
                    id="crypto-ciphertext"
                    class="crypto-cipher-box"
                >
                </div>


                <div
                    id="crypto-partial"
                    class="crypto-plaintext-box"
                >
                </div>


                <div
                    id="crypto-solved"
                    class="crypto-solved-banner"
                    hidden
                >
                    ✓ CRYPTOGRAM SOLVED
                </div>

            </div>


            <!-- ========================================
                 FREQUENCY
            ========================================= -->

            <div class="crypto-stage">

                <div class="crypto-stage-number">
                    CLUE 1
                </div>

                <h3>
                    Count letter frequencies
                </h3>

                <p class="crypto-stage-description">
                    Frequent ciphertext letters are worth
                    investigating because English letters
                    such as E, T, A, O, I, and N are common.
                    Frequency is evidence, not proof.
                </p>


                <div class="crypto-rule">
                    High frequency suggests possibilities.
                    It does not guarantee a specific letter.
                </div>


                <div
                    id="crypto-frequency"
                    class="crypto-frequency-grid"
                >
                </div>

            </div>


            <!-- ========================================
                 PATTERNS
            ========================================= -->

            <div class="crypto-stage">

                <div class="crypto-stage-number">
                    CLUE 2
                </div>

                <h3 id="crypto-pattern-title">
                    Look at word patterns
                </h3>

                <p
                    id="crypto-pattern-description"
                    class="crypto-stage-description"
                >
                </p>


                <div
                    id="crypto-patterns"
                    class="crypto-pattern-list"
                >
                </div>


                <div
                    id="crypto-repeats"
                    class="crypto-repeat-grid"
                >
                </div>

            </div>


            <!-- ========================================
                 MAPPING
            ========================================= -->

            <div class="crypto-stage">

                <div class="crypto-stage-number">
                    SOLVE
                </div>

                <h3>
                    Make a tentative substitution
                </h3>

                <p class="crypto-stage-description">
                    Click any ciphertext letter above or in
                    the frequency table. Then enter what you
                    think its plaintext letter represents.
                    The trainer prevents impossible
                    one-to-many mappings.
                </p>


                <div class="crypto-guess-panel">


                    <div class="crypto-guess-field">

                        <label for="crypto-selected-letter">
                            CIPHERTEXT LETTER
                        </label>

                        <input
                            id="crypto-selected-letter"
                            type="text"
                            maxlength="1"
                            readonly
                            placeholder="?"
                        >

                    </div>


                    <div class="crypto-guess-field">

                        <label for="crypto-plain-guess">
                            PLAINTEXT GUESS
                        </label>

                        <input
                            id="crypto-plain-guess"
                            type="text"
                            maxlength="1"
                            autocomplete="off"
                            placeholder="?"
                        >

                    </div>


                    <button
                        id="crypto-apply-guess"
                        type="button"
                        class="crypto-guess-button"
                    >
                        Apply
                    </button>


                </div>


                <div
                    id="crypto-feedback"
                    class="crypto-feedback"
                >
                </div>


                <h3>
                    Current substitution map
                </h3>


                <div
                    id="crypto-mapping"
                    class="crypto-mapping-grid"
                >
                </div>


                <div class="crypto-action-grid">

                    <button
                        id="crypto-clear-letter"
                        type="button"
                        class="crypto-secondary-button"
                    >
                        Clear Selected Guess
                    </button>

                    <button
                        id="crypto-reset"
                        type="button"
                        class="crypto-secondary-button"
                    >
                        Reset Puzzle
                    </button>

                    <button
                        id="crypto-reveal"
                        type="button"
                        class="crypto-secondary-button"
                    >
                        Reveal Solution
                    </button>

                </div>

            </div>


            <!-- ========================================
                 SOLVING METHOD
            ========================================= -->

            <div class="crypto-stage">

                <div class="crypto-stage-number">
                    STRATEGY
                </div>

                <h3>
                    A strong solving loop
                </h3>


                <div class="crypto-rule">
                    observe → hypothesize → apply mapping
                    → check every occurrence → revise
                </div>


                <p class="crypto-stage-description">

                    Do not solve by making isolated guesses.
                    Every substitution affects every
                    occurrence of that ciphertext letter.
                    A useful guess should improve several
                    parts of the message without creating
                    contradictions elsewhere.

                </p>


                <button
                    id="crypto-new-puzzle"
                    type="button"
                    class="primary-button"
                >
                    Generate New Training Puzzle
                </button>

            </div>


        </div>

        `;
    }


    /*
    =====================================================
    EVENTS
    =====================================================
    */

    function setupEvents() {

        document
            .getElementById(
                "crypto-apply-guess"
            )
            .addEventListener(
                "click",
                applyGuess
            );


        document
            .getElementById(
                "crypto-plain-guess"
            )
            .addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        applyGuess();
                    }
                }
            );


        document
            .getElementById(
                "crypto-plain-guess"
            )
            .addEventListener(
                "input",
                event => {

                    event.target.value =
                        cleanSingleLetter(
                            event.target.value
                        );

                }
            );


        document
            .getElementById(
                "crypto-clear-letter"
            )
            .addEventListener(
                "click",
                clearSelectedGuess
            );


        document
            .getElementById(
                "crypto-reset"
            )
            .addEventListener(
                "click",
                resetPuzzle
            );


        document
            .getElementById(
                "crypto-reveal"
            )
            .addEventListener(
                "click",
                revealSolution
            );


        document
            .getElementById(
                "crypto-new-puzzle"
            )
            .addEventListener(
                "click",
                newPuzzle
            );

    }


    /*
    =====================================================
    NEW PUZZLE
    =====================================================
    */

    function newPuzzle() {

        const phrase =
            randomItem(
                TRAINING_PHRASES
            );


        plaintext =
            phrase
                .toUpperCase();


        const key =
            CipherEngine
                .generateKey(
                    "aristocrat",
                    "Medium"
                );


        substitutionAlphabet =
            key.alphabet;


        if (
            mode ===
            "aristocrat"
        ) {

            ciphertext =
                CipherEngine.encrypt(
                    "aristocrat",
                    plaintext,
                    {
                        alphabet:
                            substitutionAlphabet
                    }
                );

        } else {

            ciphertext =
                CipherEngine.encrypt(
                    "patristocrat",
                    plaintext,
                    {
                        alphabet:
                            substitutionAlphabet
                    }
                );
        }


        mapping =
            {};


        selectedCipherLetter =
            null;


        document.getElementById(
            "crypto-selected-letter"
        ).value =
            "";


        document.getElementById(
            "crypto-plain-guess"
        ).value =
            "";


        clearFeedback();


        renderEverything();

    }


    /*
    =====================================================
    RESET
    =====================================================
    */

    function resetPuzzle() {

        mapping =
            {};


        selectedCipherLetter =
            null;


        document.getElementById(
            "crypto-selected-letter"
        ).value =
            "";


        document.getElementById(
            "crypto-plain-guess"
        ).value =
            "";


        clearFeedback();


        renderEverything();
    }


    /*
    =====================================================
    MAIN RENDER
    =====================================================
    */

    function renderEverything() {

        renderCiphertext();

        renderPartialPlaintext();

        renderFrequency();

        renderPatterns();

        renderMapping();

        checkSolved();

    }


    /*
    =====================================================
    CIPHERTEXT
    =====================================================
    */

    function renderCiphertext() {

        const container =
            document.getElementById(
                "crypto-ciphertext"
            );


        container.innerHTML =
            "";


        for (
            const character
            of ciphertext
        ) {

            if (
                ALPHABET.includes(
                    character
                )
            ) {

                const span =
                    document.createElement(
                        "span"
                    );


                span.className =
                    "crypto-cipher-letter";


                span.textContent =
                    character;


                span.dataset.letter =
                    character;


                if (
                    character ===
                    selectedCipherLetter
                ) {

                    span.classList.add(
                        "selected"
                    );
                }


                span.addEventListener(
                    "click",
                    () => {

                        selectCipherLetter(
                            character
                        );

                    }
                );


                container.appendChild(
                    span
                );

            } else {

                container.appendChild(
                    document.createTextNode(
                        character
                    )
                );
            }
        }
    }


    /*
    =====================================================
    PARTIAL PLAINTEXT
    =====================================================
    */

    function renderPartialPlaintext() {

        const container =
            document.getElementById(
                "crypto-partial"
            );


        container.innerHTML =
            "";


        for (
            const character
            of ciphertext
        ) {

            if (
                ALPHABET.includes(
                    character
                )
            ) {

                const span =
                    document.createElement(
                        "span"
                    );


                const guess =
                    mapping[
                        character
                    ];


                if (
                    guess
                ) {

                    span.className =
                        "crypto-known";


                    span.textContent =
                        guess;

                } else {

                    span.className =
                        "crypto-unknown";


                    span.textContent =
                        "_";
                }


                container.appendChild(
                    span
                );

            } else {

                container.appendChild(
                    document.createTextNode(
                        character
                    )
                );
            }
        }
    }


    /*
    =====================================================
    FREQUENCY
    =====================================================
    */

    function renderFrequency() {

        const counts =
            {};


        let total =
            0;


        for (
            const character
            of ciphertext
        ) {

            if (
                !ALPHABET.includes(
                    character
                )
            ) {

                continue;
            }


            counts[
                character
            ] =
                (
                    counts[
                        character
                    ]
                    ||
                    0
                )
                +
                1;


            total++;
        }


        const sorted =
            Object.entries(
                counts
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    b[1]
                    -
                    a[1]
                    ||
                    a[0]
                        .localeCompare(
                            b[0]
                        )
            );


        const max =
            sorted.length
                ?
                sorted[0][1]
                :
                1;


        const container =
            document.getElementById(
                "crypto-frequency"
            );


        container.innerHTML =
            "";


        sorted.forEach(
            (
                [
                    letter,
                    count
                ]
            ) => {

                const card =
                    document.createElement(
                        "button"
                    );


                card.type =
                    "button";


                card.className =
                    "crypto-frequency-card";


                if (
                    letter ===
                    selectedCipherLetter
                ) {

                    card.classList.add(
                        "selected"
                    );
                }


                const percent =
                    total
                    ?
                    Math.round(
                        count
                        /
                        total
                        *
                        100
                    )
                    :
                    0;


                const width =
                    Math.round(
                        count
                        /
                        max
                        *
                        100
                    );


                card.innerHTML =
                    `

                    <span class="crypto-frequency-letter">
                        ${letter}
                    </span>

                    <span class="crypto-frequency-count">
                        ${count} uses • ${percent}%
                    </span>

                    <div class="crypto-frequency-bar">

                        <div
                            class="crypto-frequency-fill"
                            style="width:${width}%"
                        >
                        </div>

                    </div>

                    `;


                card.addEventListener(
                    "click",
                    () => {

                        selectCipherLetter(
                            letter
                        );

                    }
                );


                container.appendChild(
                    card
                );

            }
        );
    }


    /*
    =====================================================
    PATTERNS
    =====================================================
    */

    function renderPatterns() {

        const title =
            document.getElementById(
                "crypto-pattern-title"
            );


        const description =
            document.getElementById(
                "crypto-pattern-description"
            );


        const patternContainer =
            document.getElementById(
                "crypto-patterns"
            );


        const repeatContainer =
            document.getElementById(
                "crypto-repeats"
            );


        patternContainer.innerHTML =
            "";


        repeatContainer.innerHTML =
            "";


        if (
            mode ===
            "aristocrat"
        ) {

            title.textContent =
                "Look at word patterns";


            description.textContent =
                "Spaces are preserved in an Aristocrat. That means word lengths and repeated-letter structures survive encryption and can provide very strong clues.";


            repeatContainer.hidden =
                true;


            patternContainer.hidden =
                false;


            const words =
                ciphertext
                    .match(
                        /[A-Z]+/g
                    )
                    ||
                    [];


            const uniqueWords =
                [
                    ...new Set(
                        words
                    )
                ];


            uniqueWords
                .slice(
                    0,
                    12
                )
                .forEach(
                    word => {

                        const row =
                            document.createElement(
                                "div"
                            );


                        row.className =
                            "crypto-pattern-row";


                        const signature =
                            wordPattern(
                                word
                            );


                        const note =
                            patternNote(
                                word,
                                signature
                            );


                        row.innerHTML =
                            `

                            <div class="crypto-pattern-word">
                                ${word}
                            </div>

                            <div class="crypto-pattern-signature">
                                ${signature}
                            </div>

                            <div class="crypto-pattern-note">
                                ${note}
                            </div>

                            `;


                        patternContainer.appendChild(
                            row
                        );

                    }
                );


        } else {

            title.textContent =
                "Look for repeated sequences";


            description.textContent =
                "Patristocrat removes the original word boundaries. Instead of relying on visible word lengths, look for repeated ciphertext sequences and recurring letter structures.";


            patternContainer.hidden =
                true;


            repeatContainer.hidden =
                false;


            const repeats =
                findRepeatedSequences(
                    ciphertext
                        .replace(
                            /[^A-Z]/g,
                            ""
                        )
                );


            if (
                repeats.length ===
                0
            ) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "crypto-repeat-card";


                card.textContent =
                    "No major repeated sequences in this example.";


                repeatContainer.appendChild(
                    card
                );


            } else {

                repeats
                    .slice(
                        0,
                        12
                    )
                    .forEach(
                        item => {

                            const card =
                                document.createElement(
                                    "div"
                                );


                            card.className =
                                "crypto-repeat-card";


                            card.textContent =
                                `${item.sequence} × ${item.count}`;


                            repeatContainer.appendChild(
                                card
                            );

                        }
                    );
            }
        }
    }


    /*
    =====================================================
    WORD PATTERN
    =====================================================
    */

    function wordPattern(
        word
    ) {

        const seen =
            {};


        let next =
            0;


        return [
            ...word
        ]
        .map(
            letter => {

                if (
                    seen[
                        letter
                    ]
                    ===
                    undefined
                ) {

                    seen[
                        letter
                    ] =
                        next;


                    next++;
                }


                return seen[
                    letter
                ];

            }
        )
        .join("-");
    }


    function patternNote(
        word,
        signature
    ) {

        if (
            word.length ===
            1
        ) {

            return "One-letter word: often A or I.";
        }


        const repeated =
            new Set(
                word
            ).size
            <
            word.length;


        if (
            repeated
        ) {

            return "Contains repeated letters — a strong structural clue.";
        }


        if (
            word.length ===
            2
        ) {

            return "Two-letter word: compare against common English words.";
        }


        if (
            word.length >=
            7
        ) {

            return "Long word; partial mappings may reveal recognizable fragments.";
        }


        return `Pattern ${signature} can be compared with candidate words.`;
    }


    /*
    =====================================================
    REPEATED SEQUENCES
    =====================================================
    */

    function findRepeatedSequences(
        text
    ) {

        const found =
            new Map();


        [
            3,
            2
        ]
        .forEach(
            length => {

                for (
                    let i = 0;
                    i <=
                    text.length
                    -
                    length;
                    i++
                ) {

                    const sequence =
                        text.slice(
                            i,
                            i + length
                        );


                    found.set(
                        sequence,
                        (
                            found.get(
                                sequence
                            )
                            ||
                            0
                        )
                        +
                        1
                    );
                }

            }
        );


        return [
            ...found.entries()
        ]
        .filter(
            (
                [
                    ,
                    count
                ]
            ) =>
                count >
                1
        )
        .map(
            (
                [
                    sequence,
                    count
                ]
            ) => ({

                sequence,

                count

            })
        )
        .sort(
            (
                a,
                b
            ) =>
                b.sequence.length
                -
                a.sequence.length
                ||
                b.count
                -
                a.count
        );
    }


    /*
    =====================================================
    SELECT LETTER
    =====================================================
    */

    function selectCipherLetter(
        letter
    ) {

        selectedCipherLetter =
            letter;


        document.getElementById(
            "crypto-selected-letter"
        ).value =
            letter;


        document.getElementById(
            "crypto-plain-guess"
        ).value =
            mapping[
                letter
            ]
            ||
            "";


        document.getElementById(
            "crypto-plain-guess"
        ).focus({
            preventScroll: true
        });


        renderCiphertext();

        renderFrequency();

    }


    /*
    =====================================================
    APPLY GUESS
    =====================================================
    */

    function applyGuess() {

        const cipherLetter =
            selectedCipherLetter;


        const plainLetter =
            cleanSingleLetter(
                document
                    .getElementById(
                        "crypto-plain-guess"
                    )
                    .value
            );


        if (
            !cipherLetter
        ) {

            showFeedback(
                "Select a ciphertext letter first.",
                "error"
            );


            return;
        }


        if (
            !plainLetter
        ) {

            showFeedback(
                "Enter one plaintext letter.",
                "error"
            );


            return;
        }


        /*
        Monoalphabetic substitution must be one-to-one.

        If another cipher letter already maps to the same
        plaintext letter, reject the guess.
        */

        const conflict =
            Object.entries(
                mapping
            )
            .find(
                (
                    [
                        existingCipher,
                        existingPlain
                    ]
                ) =>
                    existingCipher
                    !==
                    cipherLetter
                    &&
                    existingPlain
                    ===
                    plainLetter
            );


        if (
            conflict
        ) {

            showFeedback(
                `${plainLetter} is already assigned to ciphertext ${conflict[0]}. A monoalphabetic substitution must be one-to-one.`,
                "error"
            );


            return;
        }


        mapping[
            cipherLetter
        ] =
            plainLetter;


        showFeedback(
            `${cipherLetter} → ${plainLetter} applied everywhere.`,
            "success"
        );


        renderEverything();

    }


    /*
    =====================================================
    CLEAR
    =====================================================
    */

    function clearSelectedGuess() {

        if (
            !selectedCipherLetter
        ) {

            showFeedback(
                "Select a ciphertext letter first.",
                "error"
            );


            return;
        }


        delete mapping[
            selectedCipherLetter
        ];


        document.getElementById(
            "crypto-plain-guess"
        ).value =
            "";


        showFeedback(
            `Cleared mapping for ${selectedCipherLetter}.`,
            "success"
        );


        renderEverything();
    }


    /*
    =====================================================
    MAPPING TABLE
    =====================================================
    */

    function renderMapping() {

        const container =
            document.getElementById(
                "crypto-mapping"
            );


        container.innerHTML =
            "";


        for (
            const cipherLetter
            of ALPHABET
        ) {

            const cell =
                document.createElement(
                    "button"
                );


            cell.type =
                "button";


            cell.className =
                "crypto-map-cell";


            cell.innerHTML =
                `

                <span class="crypto-map-cipher">
                    ${cipherLetter}
                </span>

                <span class="crypto-map-plain">
                    ${mapping[cipherLetter] || "·"}
                </span>

                `;


            cell.addEventListener(
                "click",
                () => {

                    selectCipherLetter(
                        cipherLetter
                    );

                }
            );


            container.appendChild(
                cell
            );
        }
    }


    /*
    =====================================================
    SOLVED CHECK
    =====================================================
    */

    function checkSolved() {

        const decoded =
            decodeWithMapping();


        const target =
            mode ===
            "aristocrat"
                ?
                plaintext
                :
                plaintext
                    .replace(
                        /[^A-Z]/g,
                        ""
                    );


        const normalizedDecoded =
            decoded
                .replace(
                    /_/g,
                    ""
                )
                .replace(
                    /[^A-Z]/g,
                    ""
                );


        const normalizedTarget =
            target
                .replace(
                    /[^A-Z]/g,
                    ""
                );


        const solved =
            normalizedDecoded
            ===
            normalizedTarget
            &&
            !decoded.includes(
                "_"
            );


        document.getElementById(
            "crypto-solved"
        ).hidden =
            !solved;
    }


    /*
    =====================================================
    DECODE
    =====================================================
    */

    function decodeWithMapping() {

        let result =
            "";


        for (
            const character
            of ciphertext
        ) {

            if (
                ALPHABET.includes(
                    character
                )
            ) {

                result +=
                    mapping[
                        character
                    ]
                    ||
                    "_";

            } else {

                result +=
                    character;
            }
        }


        return result;
    }


    /*
    =====================================================
    REVEAL
    =====================================================
    */

    function revealSolution() {

        /*
        Reverse the known encryption alphabet.

        substitutionAlphabet[index] is the ciphertext
        letter for plaintext ALPHABET[index].
        */

        mapping =
            {};


        for (
            let i = 0;
            i < ALPHABET.length;
            i++
        ) {

            mapping[
                substitutionAlphabet[
                    i
                ]
            ] =
                ALPHABET[
                    i
                ];
        }


        showFeedback(
            "Solution revealed. Study how every mapping affects all occurrences.",
            "success"
        );


        renderEverything();
    }


    /*
    =====================================================
    FEEDBACK
    =====================================================
    */

    function showFeedback(
        message,
        type
    ) {

        const output =
            document.getElementById(
                "crypto-feedback"
            );


        output.textContent =
            message;


        output.className =
            `crypto-feedback ${type}`;
    }


    function clearFeedback() {

        const output =
            document.getElementById(
                "crypto-feedback"
            );


        if (
            output
        ) {

            output.textContent =
                "";


            output.className =
                "crypto-feedback";
        }
    }


    /*
    =====================================================
    HELPERS
    =====================================================
    */

    function randomItem(
        array
    ) {

        return array[
            Math.floor(
                Math.random()
                *
                array.length
            )
        ];
    }


    function cleanSingleLetter(
        value
    ) {

        return String(
            value
            ||
            ""
        )
        .toUpperCase()
        .replace(
            /[^A-Z]/g,
            ""
        )
        .slice(
            0,
            1
        );
    }


    /*
    =====================================================
    PUBLIC
    =====================================================
    */

    return {

        initialize

    };


})();