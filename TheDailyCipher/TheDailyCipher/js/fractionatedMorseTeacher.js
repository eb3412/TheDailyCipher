/*
=========================================================
THE DAILY CIPHER
FRACTIONATED MORSE VISUAL TEACHER
=========================================================
*/


const FractionatedMorseTeacher = (() => {


    const MORSE = {

        A: ".-",
        B: "-...",
        C: "-.-.",
        D: "-..",
        E: ".",
        F: "..-.",
        G: "--.",
        H: "....",
        I: "..",
        J: ".---",
        K: "-.-",
        L: ".-..",
        M: "--",
        N: "-.",
        O: "---",
        P: ".--.",
        Q: "--.-",
        R: ".-.",
        S: "...",
        T: "-",
        U: "..-",
        V: "...-",
        W: ".--",
        X: "-..-",
        Y: "-.--",
        Z: "--.."

    };


    const ALPHABET =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


    const TRIGRAMS =
        (() => {

            const symbols =
                [".", "-", "x"];


            const result =
                [];


            for (
                const a
                of symbols
            ) {

                for (
                    const b
                    of symbols
                ) {

                    for (
                        const c
                        of symbols
                    ) {

                        const trigram =
                            a + b + c;


                        if (
                            trigram !==
                            "xxx"
                        ) {

                            result.push(
                                trigram
                            );
                        }
                    }
                }
            }


            return result;

        })();


    let currentData =
        null;


    let currentTrigram =
        0;


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
            guide.id !==
            "fractionatedmorse"
        ) {

            return;
        }


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
            "Build Fractionated Morse From Scratch";


        document.getElementById(
            "teaching-description"
        ).textContent =
            "Fractionated Morse looks unusual because one ciphertext letter does not correspond directly to one plaintext letter. First the plaintext becomes Morse code, then the Morse stream is regrouped into triples, and only then are ciphertext letters produced.";


        container.innerHTML =
            createHTML();


        setupEvents();

        rebuild();

    }


    /*
    =====================================================
    HTML
    =====================================================
    */

    function createHTML() {

        return `

        <div class="fm-teacher">


            <!-- CONTROLS -->

            <div class="fm-stage">

                <div class="fm-stage-number">
                    YOUR EXAMPLE
                </div>

                <h3>
                    Choose plaintext and keyword
                </h3>

                <p class="fm-stage-description">
                    The keyword builds the substitution
                    alphabet used after the Morse stream
                    has been grouped.
                </p>


                <div class="fm-input-grid">

                    <div class="fm-input-field">

                        <label for="fm-text">
                            PLAINTEXT
                        </label>

                        <input
                            id="fm-text"
                            type="text"
                            value="HELLO WORLD"
                            maxlength="24"
                            autocomplete="off"
                        >

                    </div>


                    <div class="fm-input-field">

                        <label for="fm-keyword">
                            KEYWORD
                        </label>

                        <input
                            id="fm-keyword"
                            type="text"
                            value="CIPHER"
                            maxlength="20"
                            autocomplete="off"
                        >

                    </div>

                </div>

            </div>


            <!-- STEP 1 -->

            <div class="fm-stage">

                <div class="fm-stage-number">
                    STEP 1
                </div>

                <h3>
                    Convert letters to Morse
                </h3>

                <p class="fm-stage-description">
                    Each plaintext letter first becomes
                    normal Morse code. At this point,
                    Fractionated Morse has not yet done
                    any substitution.
                </p>


                <div
                    id="fm-morse-table"
                    class="fm-morse-table"
                >
                </div>

            </div>


            <!-- STEP 2 -->

            <div class="fm-stage">

                <div class="fm-stage-number">
                    STEP 2
                </div>

                <h3>
                    Add separators
                </h3>

                <p class="fm-stage-description">
                    We need to remember where Morse letters
                    and words end. The symbol x is used as
                    a separator.
                </p>


                <div class="fm-rule">
                    x = letter separator
                    &nbsp;&nbsp; | &nbsp;&nbsp;
                    xx = word separator
                </div>


                <div
                    id="fm-morse-stream"
                    class="fm-stream"
                >
                </div>

            </div>


            <!-- STEP 3 -->

            <div class="fm-stage">

                <div class="fm-stage-number">
                    STEP 3
                </div>

                <h3>
                    Ignore the original letter boundaries
                </h3>

                <p class="fm-stage-description">
                    This is the key idea. Once the Morse
                    stream exists, we stop caring which
                    dots and dashes belonged to which
                    original plaintext letter.
                </p>


                <div class="fm-rule">
                    The continuous Morse stream is now
                    divided into groups of exactly 3 symbols.
                </div>


                <div
                    id="fm-trigrams"
                    class="fm-trigram-grid"
                >
                </div>

            </div>


            <!-- STEP 4 -->

            <div class="fm-stage">

                <div class="fm-stage-number">
                    STEP 4
                </div>

                <h3>
                    Build the keyed alphabet
                </h3>

                <p class="fm-stage-description">
                    Write the unique letters of the keyword
                    first, then append every unused letter
                    of the alphabet.
                </p>


                <div
                    id="fm-keyed-alphabet"
                    class="fm-keyed-alphabet"
                >
                </div>

            </div>


            <!-- STEP 5 -->

            <div class="fm-stage">

                <div class="fm-stage-number">
                    STEP 5
                </div>

                <h3>
                    Convert each trigram into a letter
                </h3>

                <p class="fm-stage-description">
                    There are 26 allowed combinations of
                    dot, dash, and x when xxx is excluded.
                    Each trigram position corresponds to
                    one letter of the keyed alphabet.
                </p>


                <div
                    id="fm-selected-pipeline"
                >
                </div>


                <div class="fm-position-controls">

                    <button
                        id="fm-prev"
                        type="button"
                        class="fm-position-button"
                    >
                        ←
                    </button>

                    <div
                        id="fm-position"
                        class="fm-position-count"
                    >
                    </div>

                    <button
                        id="fm-next"
                        type="button"
                        class="fm-position-button"
                    >
                        →
                    </button>

                </div>

            </div>


            <!-- STEP 6 -->

            <div class="fm-stage">

                <div class="fm-stage-number">
                    STEP 6
                </div>

                <h3>
                    See the complete pipeline
                </h3>


                <div
                    id="fm-full-result"
                >
                </div>

            </div>


            <!-- DECRYPT -->

            <div class="fm-stage">

                <div class="fm-stage-number">
                    DECRYPTION
                </div>

                <h3>
                    Reverse the process
                </h3>

                <p class="fm-stage-description">
                    Convert each ciphertext letter back to
                    its trigram, join all the trigrams, then
                    use x separators to reconstruct the Morse
                    letters and words.
                </p>


                <div class="fm-rule">
                    ciphertext letter
                    → trigram
                    → Morse stream
                    → Morse letters
                    → plaintext
                </div>

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

        [
            "fm-text",
            "fm-keyword"
        ]
        .forEach(
            id => {

                document
                    .getElementById(
                        id
                    )
                    .addEventListener(
                        "input",
                        rebuild
                    );

            }
        );


        document
            .getElementById(
                "fm-prev"
            )
            .addEventListener(
                "click",
                () => {

                    if (
                        !currentData
                    ) {

                        return;
                    }


                    currentTrigram--;


                    if (
                        currentTrigram < 0
                    ) {

                        currentTrigram =
                            currentData
                                .trigrams
                                .length
                            -
                            1;
                    }


                    renderSelected();

                }
            );


        document
            .getElementById(
                "fm-next"
            )
            .addEventListener(
                "click",
                () => {

                    if (
                        !currentData
                    ) {

                        return;
                    }


                    currentTrigram =
                        (
                            currentTrigram
                            +
                            1
                        )
                        %
                        currentData
                            .trigrams
                            .length;


                    renderSelected();

                }
            );

    }


    /*
    =====================================================
    REBUILD
    =====================================================
    */

    function rebuild() {

        const plaintext =
            cleanText(
                document
                    .getElementById(
                        "fm-text"
                    )
                    .value
            );


        const keyword =
            cleanLetters(
                document
                    .getElementById(
                        "fm-keyword"
                    )
                    .value
            );


        if (
            !plaintext
            ||
            !keyword
        ) {

            return;
        }


        const keyedAlphabet =
            buildKeyedAlphabet(
                keyword
            );


        let stream =
            plaintextToStream(
                plaintext
            );


        while (
            stream.length % 3
            !==
            0
        ) {

            stream +=
                "x";
        }


        const trigrams =
            [];


        for (
            let i = 0;
            i < stream.length;
            i += 3
        ) {

            trigrams.push(
                stream.slice(
                    i,
                    i + 3
                )
            );
        }


        const cipherLetters =
            trigrams.map(
                trigram => {

                    const index =
                        TRIGRAMS
                            .indexOf(
                                trigram
                            );


                    return keyedAlphabet[
                        index
                    ];

                }
            );


        currentData = {

            plaintext,

            keyword,

            keyedAlphabet,

            stream,

            trigrams,

            cipherLetters,

            ciphertext:
                cipherLetters.join("")

        };


        if (
            currentTrigram >=
            trigrams.length
        ) {

            currentTrigram =
                0;
        }


        renderMorseTable();

        renderStream();

        renderTrigrams();

        renderKeyedAlphabet();

        renderSelected();

        renderFullResult();

    }


    /*
    =====================================================
    MORSE TABLE
    =====================================================
    */

    function renderMorseTable() {

        const container =
            document.getElementById(
                "fm-morse-table"
            );


        container.innerHTML =
            "";


        const usedLetters =
            new Set(
                currentData
                    .plaintext
                    .replace(
                        /[^A-Z]/g,
                        ""
                    )
            );


        Object.entries(
            MORSE
        )
        .forEach(
            (
                [
                    letter,
                    code
                ]
            ) => {

                const cell =
                    document.createElement(
                        "div"
                    );


                cell.className =
                    "fm-morse-cell";


                if (
                    usedLetters.has(
                        letter
                    )
                ) {

                    cell.classList.add(
                        "highlighted"
                    );
                }


                cell.innerHTML =
                    `

                    <span class="fm-morse-letter">
                        ${letter}
                    </span>

                    <span class="fm-morse-code">
                        ${code}
                    </span>

                    `;


                container.appendChild(
                    cell
                );

            }
        );
    }


    /*
    =====================================================
    STREAM
    =====================================================
    */

    function renderStream() {

        const display =
            currentData.stream
                .replace(
                    /x/g,
                    `<span class="separator">x</span>`
                );


        document.getElementById(
            "fm-morse-stream"
        ).innerHTML =
            display;
    }


    /*
    =====================================================
    TRIGRAMS
    =====================================================
    */

    function renderTrigrams() {

        const container =
            document.getElementById(
                "fm-trigrams"
            );


        container.innerHTML =
            "";


        currentData.trigrams
            .forEach(
                (
                    trigram,
                    index
                ) => {

                    const element =
                        document.createElement(
                            "button"
                        );


                    element.type =
                        "button";


                    element.className =
                        "fm-trigram";


                    element.textContent =
                        trigram;


                    if (
                        index ===
                        currentTrigram
                    ) {

                        element.classList.add(
                            "active"
                        );
                    }


                    element.addEventListener(
                        "click",
                        () => {

                            currentTrigram =
                                index;


                            renderSelected();

                        }
                    );


                    container.appendChild(
                        element
                    );

                }
            );
    }


    /*
    =====================================================
    KEYED ALPHABET
    =====================================================
    */

    function renderKeyedAlphabet() {

        const container =
            document.getElementById(
                "fm-keyed-alphabet"
            );


        container.innerHTML =
            "";


        [
            ...currentData
                .keyedAlphabet
        ]
        .forEach(
            (
                letter,
                index
            ) => {

                const cell =
                    document.createElement(
                        "div"
                    );


                cell.className =
                    "fm-key-cell";


                if (
                    index ===
                    TRIGRAMS.indexOf(
                        currentData
                            .trigrams[
                                currentTrigram
                            ]
                    )
                ) {

                    cell.classList.add(
                        "highlighted"
                    );
                }


                cell.innerHTML =
                    `

                    <span class="fm-key-letter">
                        ${letter}
                    </span>

                    <span class="fm-key-index">
                        ${index + 1}
                    </span>

                    `;


                container.appendChild(
                    cell
                );

            }
        );
    }


    /*
    =====================================================
    SELECTED TRIGRAM
    =====================================================
    */

    function renderSelected() {

        const trigram =
            currentData
                .trigrams[
                    currentTrigram
                ];


        const index =
            TRIGRAMS.indexOf(
                trigram
            );


        const letter =
            currentData
                .keyedAlphabet[
                    index
                ];


        document.getElementById(
            "fm-selected-pipeline"
        ).innerHTML =
            `

            <div class="fm-pipeline">

                ${pipelineCard(
                    "TRIGRAM",
                    trigram
                )}

                <div class="fm-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "TRIGRAM POSITION",
                    index + 1
                )}

                <div class="fm-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "KEYED LETTER",
                    letter
                )}

            </div>

            `;


        document.getElementById(
            "fm-position"
        ).textContent =
            `Group ${currentTrigram + 1} of ${currentData.trigrams.length}`;


        document
            .querySelectorAll(
                ".fm-trigram"
            )
            .forEach(
                (
                    element,
                    indexValue
                ) => {

                    element.classList.toggle(
                        "active",
                        indexValue ===
                        currentTrigram
                    );

                }
            );


        renderKeyedAlphabet();
    }


    /*
    =====================================================
    FULL RESULT
    =====================================================
    */

    function renderFullResult() {

        document.getElementById(
            "fm-full-result"
        ).innerHTML =
            `

            <div class="fm-pipeline">

                ${pipelineCard(
                    "PLAINTEXT",
                    currentData.plaintext
                )}

                <div class="fm-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "MORSE STREAM",
                    currentData.stream
                )}

                <div class="fm-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "GROUPS",
                    currentData.trigrams.join(" ")
                )}

                <div class="fm-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "CIPHERTEXT",
                    currentData.ciphertext
                )}

            </div>

            `;
    }


    /*
    =====================================================
    MORSE STREAM
    =====================================================
    */

    function plaintextToStream(
        plaintext
    ) {

        const words =
            plaintext.match(
                /[A-Z]+/g
            )
            ||
            [];


        return words
            .map(
                word =>
                    word
                        .split("")
                        .map(
                            letter =>
                                MORSE[
                                    letter
                                ]
                        )
                        .join(
                            "x"
                        )
            )
            .join(
                "xx"
            );
    }


    /*
    =====================================================
    KEYED ALPHABET
    =====================================================
    */

    function buildKeyedAlphabet(
        keyword
    ) {

        let result =
            "";


        for (
            const character
            of
            (
                keyword
                +
                ALPHABET
            )
        ) {

            if (
                !result.includes(
                    character
                )
            ) {

                result +=
                    character;
            }
        }


        return result;
    }


    /*
    =====================================================
    HELPERS
    =====================================================
    */

    function pipelineCard(
        label,
        value
    ) {

        return `

        <div class="fm-pipeline-card">

            <div class="fm-pipeline-label">
                ${label}
            </div>

            <div class="fm-pipeline-value">
                ${value}
            </div>

        </div>

        `;
    }


    function cleanText(
        value
    ) {

        return String(
            value || ""
        )
        .toUpperCase()
        .replace(
            /[^A-Z ]/g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
    }


    function cleanLetters(
        value
    ) {

        return String(
            value || ""
        )
        .toUpperCase()
        .replace(
            /[^A-Z]/g,
            ""
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