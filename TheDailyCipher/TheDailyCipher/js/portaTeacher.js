/*
=========================================================
THE DAILY CIPHER
PORTA CIPHER VISUAL TEACHER
=========================================================

Important:
This teacher uses CipherEngine.encrypt() for actual
letter transformations.

That means CipherEngine remains the source of truth.
=========================================================
*/


const PortaTeacher = (() => {


    const ALPHABET =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


    const PAIRS =
        [
            "A/B",
            "C/D",
            "E/F",
            "G/H",
            "I/J",
            "K/L",
            "M/N",
            "O/P",
            "Q/R",
            "S/T",
            "U/V",
            "W/X",
            "Y/Z"
        ];


    let currentData =
        null;


    let currentPosition =
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
            "porta"
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
            "Build a Porta Cipher From Scratch";


        document.getElementById(
            "teaching-description"
        ).textContent =
            "Porta is a polyalphabetic cipher, which means the substitution can change from one position to the next. The repeating keyword decides which Porta alphabet is used for each plaintext letter.";


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

        <div class="porta-teacher">


            <!-- CONTROLS -->

            <div class="porta-stage">

                <div class="porta-stage-number">
                    YOUR EXAMPLE
                </div>

                <h3>
                    Choose plaintext and keyword
                </h3>

                <p class="porta-stage-description">
                    The keyword repeats underneath the
                    plaintext. Each keyword letter selects
                    one of thirteen Porta substitution rows.
                </p>


                <div class="porta-input-grid">

                    <div class="porta-input-field">

                        <label for="porta-text">
                            PLAINTEXT
                        </label>

                        <input
                            id="porta-text"
                            type="text"
                            value="HELLO WORLD"
                            maxlength="30"
                            autocomplete="off"
                        >

                    </div>


                    <div class="porta-input-field">

                        <label for="porta-keyword">
                            KEYWORD
                        </label>

                        <input
                            id="porta-keyword"
                            type="text"
                            value="SECRET"
                            maxlength="20"
                            autocomplete="off"
                        >

                    </div>

                </div>

            </div>


            <!-- STEP 1 -->

            <div class="porta-stage">

                <div class="porta-stage-number">
                    STEP 1
                </div>

                <h3>
                    Porta groups keyword letters into pairs
                </h3>

                <p class="porta-stage-description">
                    Porta has thirteen substitution rows
                    instead of twenty-six. That is because
                    A and B use the same row, C and D use
                    the same row, and so on.
                </p>


                <div class="porta-rule">
                    A/B → row 1,
                    C/D → row 2,
                    E/F → row 3,
                    ...
                    Y/Z → row 13
                </div>


                <div
                    id="porta-pairs"
                    class="porta-pair-grid"
                >
                </div>

            </div>


            <!-- STEP 2 -->

            <div class="porta-stage">

                <div class="porta-stage-number">
                    STEP 2
                </div>

                <h3>
                    Repeat the keyword
                </h3>

                <p class="porta-stage-description">
                    Keyword letters advance only when a
                    plaintext letter is processed. Spaces
                    do not consume a keyword letter.
                </p>


                <div
                    id="porta-alignment"
                    class="porta-alignment"
                >
                </div>

            </div>


            <!-- STEP 3 -->

            <div class="porta-stage">

                <div class="porta-stage-number">
                    STEP 3
                </div>

                <h3>
                    Select the row for one position
                </h3>

                <p class="porta-stage-description">
                    Use the arrows to move through the
                    plaintext. The keyword letter at that
                    position determines which Porta row is
                    active.
                </p>


                <div
                    id="porta-selected-pipeline"
                >
                </div>


                <div class="porta-position-controls">

                    <button
                        id="porta-prev"
                        type="button"
                        class="porta-position-button"
                    >
                        ←
                    </button>

                    <div
                        id="porta-position"
                        class="porta-position-count"
                    >
                    </div>

                    <button
                        id="porta-next"
                        type="button"
                        class="porta-position-button"
                    >
                        →
                    </button>

                </div>

            </div>


            <!-- STEP 4 -->

            <div class="porta-stage">

                <div class="porta-stage-number">
                    STEP 4
                </div>

                <h3>
                    Read across the active Porta row
                </h3>

                <p class="porta-stage-description">
                    The top letter in each box is plaintext.
                    The lower letter is what CipherEngine
                    maps it to under the currently selected
                    keyword pair.
                </p>


                <div class="porta-rule">
                    This row is generated using the exact
                    Porta algorithm from CipherEngine.
                </div>


                <div class="porta-row-scroll">

                    <div
                        id="porta-tableau"
                        class="porta-tableau"
                    >
                    </div>

                </div>

            </div>


            <!-- STEP 5 -->

            <div class="porta-stage">

                <div class="porta-stage-number">
                    STEP 5
                </div>

                <h3>
                    Repeat for every plaintext letter
                </h3>

                <p class="porta-stage-description">
                    Because the keyword changes which row
                    is used, the same plaintext letter can
                    encrypt differently at different
                    positions.
                </p>


                <div
                    id="porta-full-result"
                >
                </div>

            </div>


            <!-- RECIPROCAL PROPERTY -->

            <div class="porta-stage">

                <div class="porta-stage-number">
                    IMPORTANT PROPERTY
                </div>

                <h3>
                    Porta is reciprocal
                </h3>

                <p class="porta-stage-description">
                    One of Porta's most useful properties is
                    that the same operation reverses itself.
                    Encrypt ciphertext again with the same
                    keyword and the plaintext comes back.
                </p>


                <div
                    id="porta-reciprocal"
                    class="porta-reciprocal-box"
                >
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
            "porta-text",
            "porta-keyword"
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
                "porta-prev"
            )
            .addEventListener(
                "click",
                () => {

                    if (
                        !currentData
                    ) {

                        return;
                    }


                    currentPosition--;


                    if (
                        currentPosition <
                        0
                    ) {

                        currentPosition =
                            currentData
                                .letters
                                .length
                            -
                            1;
                    }


                    renderSelected();

                }
            );


        document
            .getElementById(
                "porta-next"
            )
            .addEventListener(
                "click",
                () => {

                    if (
                        !currentData
                    ) {

                        return;
                    }


                    currentPosition =
                        (
                            currentPosition
                            +
                            1
                        )
                        %
                        currentData
                            .letters
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

        const originalText =
            cleanText(
                document
                    .getElementById(
                        "porta-text"
                    )
                    .value
            );


        const keyword =
            cleanLetters(
                document
                    .getElementById(
                        "porta-keyword"
                    )
                    .value
            );


        if (
            !originalText
            ||
            !keyword
        ) {

            return;
        }


        /*
        For the teaching alignment we work with letters
        only because Porta's keyword advances only when
        a letter is processed.
        */

        const letters =
            originalText
                .replace(
                    /[^A-Z]/g,
                    ""
                );


        if (!letters) {

            return;
        }


        const repeatedKeyword =
            repeatKeyword(
                keyword,
                letters.length
            );


        const pairIndices =
            [
                ...repeatedKeyword
            ]
            .map(
                keyLetter =>
                    getPairIndex(
                        keyLetter
                    )
            );


        const ciphertextLetters =
            [
                ...letters
            ]
            .map(
                (
                    plaintextLetter,
                    index
                ) => {

                    const keyLetter =
                        repeatedKeyword[
                            index
                        ];


                    return CipherEngine.encrypt(
                        "porta",
                        plaintextLetter,
                        {
                            keyword:
                                keyLetter
                        }
                    );

                }
            );


        /*
        Whole-text ciphertext from CipherEngine.

        This is useful as an independent check that the
        teaching breakdown and production engine agree.
        */

        const engineCiphertext =
            CipherEngine.encrypt(
                "porta",
                originalText,
                {
                    keyword
                }
            );


        currentData = {

            originalText,

            keyword,

            letters,

            repeatedKeyword,

            pairIndices,

            ciphertextLetters,

            lettersCiphertext:
                ciphertextLetters.join(""),

            engineCiphertext

        };


        if (
            currentPosition >=
            letters.length
        ) {

            currentPosition =
                0;
        }


        renderPairs();

        renderAlignment();

        renderSelected();

        renderFullResult();

        renderReciprocal();

    }


    /*
    =====================================================
    KEYWORD PAIRS
    =====================================================
    */

    function renderPairs() {

        const container =
            document.getElementById(
                "porta-pairs"
            );


        container.innerHTML =
            "";


        const activePair =
            currentData
                .pairIndices[
                    currentPosition
                ];


        PAIRS.forEach(
            (
                pair,
                index
            ) => {

                const element =
                    document.createElement(
                        "div"
                    );


                element.className =
                    "porta-pair";


                if (
                    index ===
                    activePair
                ) {

                    element.classList.add(
                        "active"
                    );
                }


                element.textContent =
                    pair;


                container.appendChild(
                    element
                );

            }
        );
    }


    /*
    =====================================================
    ALIGNMENT
    =====================================================
    */

    function renderAlignment() {

        const rows =
            [

                {
                    label:
                        "PLAINTEXT",

                    values:
                        [
                            ...currentData
                                .letters
                        ]
                },

                {
                    label:
                        "KEYWORD",

                    values:
                        [
                            ...currentData
                                .repeatedKeyword
                        ],

                    className:
                        "key"
                },

                {
                    label:
                        "PAIR",

                    values:
                        currentData
                            .pairIndices
                            .map(
                                index =>
                                    PAIRS[
                                        index
                                    ]
                            ),

                    className:
                        "key"
                },

                {
                    label:
                        "CIPHERTEXT",

                    values:
                        currentData
                            .ciphertextLetters
                }

            ];


        renderAlignmentTable(
            "porta-alignment",
            rows
        );
    }


    function renderAlignmentTable(
        containerId,
        rows
    ) {

        const container =
            document.getElementById(
                containerId
            );


        container.innerHTML =
            "";


        const table =
            document.createElement(
                "div"
            );


        table.className =
            "porta-alignment-table";


        rows.forEach(
            row => {

                const rowElement =
                    document.createElement(
                        "div"
                    );


                rowElement.className =
                    "porta-alignment-row";


                rowElement.style.setProperty(
                    "--porta-length",
                    currentData
                        .letters
                        .length
                );


                const label =
                    document.createElement(
                        "div"
                    );


                label.className =
                    "porta-row-label";


                label.textContent =
                    row.label;


                rowElement.appendChild(
                    label
                );


                row.values.forEach(
                    (
                        value,
                        index
                    ) => {

                        const cell =
                            document.createElement(
                                "div"
                            );


                        cell.className =
                            "porta-data-cell";


                        if (
                            row.className
                        ) {

                            cell.classList.add(
                                row.className
                            );
                        }


                        if (
                            index ===
                            currentPosition
                        ) {

                            cell.classList.add(
                                "selected"
                            );
                        }


                        cell.textContent =
                            value;


                        rowElement.appendChild(
                            cell
                        );

                    }
                );


                table.appendChild(
                    rowElement
                );

            }
        );


        container.appendChild(
            table
        );
    }


    /*
    =====================================================
    SELECTED POSITION
    =====================================================
    */

    function renderSelected() {

        const plaintextLetter =
            currentData
                .letters[
                    currentPosition
                ];


        const keyLetter =
            currentData
                .repeatedKeyword[
                    currentPosition
                ];


        const pairIndex =
            currentData
                .pairIndices[
                    currentPosition
                ];


        const pair =
            PAIRS[
                pairIndex
            ];


        const ciphertextLetter =
            currentData
                .ciphertextLetters[
                    currentPosition
                ];


        document.getElementById(
            "porta-selected-pipeline"
        ).innerHTML =
            `

            <div class="porta-pipeline">

                ${pipelineCard(
                    "PLAINTEXT",
                    plaintextLetter
                )}

                <div class="porta-pipeline-arrow">
                    +
                </div>

                ${pipelineCard(
                    "KEY LETTER",
                    keyLetter
                )}

                <div class="porta-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "PORTA ROW",
                    pair
                )}

                <div class="porta-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "CIPHERTEXT",
                    ciphertextLetter
                )}

            </div>

            `;


        document.getElementById(
            "porta-position"
        ).textContent =
            `Letter ${currentPosition + 1} of ${currentData.letters.length}`;


        renderPairs();

        renderAlignment();

        renderTableau(
            keyLetter,
            plaintextLetter
        );
    }


    /*
    =====================================================
    TABLEAU ROW
    =====================================================
    */

    function renderTableau(
        keyLetter,
        selectedPlaintext
    ) {

        const container =
            document.getElementById(
                "porta-tableau"
            );


        container.innerHTML =
            "";


        for (
            const plaintextLetter
            of ALPHABET
        ) {

            /*
            Use CipherEngine for every mapping.

            This avoids duplicating the Porta algorithm
            inside the teaching module.
            */

            const ciphertextLetter =
                CipherEngine.encrypt(
                    "porta",
                    plaintextLetter,
                    {
                        keyword:
                            keyLetter
                    }
                );


            const cell =
                document.createElement(
                    "div"
                );


            cell.className =
                "porta-tableau-cell";


            if (
                plaintextLetter ===
                selectedPlaintext
            ) {

                cell.classList.add(
                    "plain-highlight"
                );
            }


            const plain =
                document.createElement(
                    "span"
                );


            plain.className =
                "porta-tableau-plain";


            plain.textContent =
                plaintextLetter;


            const cipher =
                document.createElement(
                    "span"
                );


            cipher.className =
                "porta-tableau-cipher";


            cipher.textContent =
                ciphertextLetter;


            cell.appendChild(
                plain
            );


            cell.appendChild(
                cipher
            );


            container.appendChild(
                cell
            );
        }
    }


    /*
    =====================================================
    FULL RESULT
    =====================================================
    */

    function renderFullResult() {

        document.getElementById(
            "porta-full-result"
        ).innerHTML =
            `

            <div class="porta-pipeline">

                ${pipelineCard(
                    "PLAINTEXT",
                    currentData.originalText
                )}

                <div class="porta-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "KEYWORD",
                    currentData.keyword
                )}

                <div class="porta-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "CIPHERTEXT",
                    currentData.engineCiphertext
                )}

            </div>


            <div class="porta-rule">
                CipherEngine result:
                ${currentData.engineCiphertext}
            </div>

            `;
    }


    /*
    =====================================================
    RECIPROCAL PROPERTY
    =====================================================
    */

    function renderReciprocal() {

        const recovered =
            CipherEngine.encrypt(
                "porta",
                currentData
                    .engineCiphertext,
                {
                    keyword:
                        currentData.keyword
                }
            );


        document.getElementById(
            "porta-reciprocal"
        ).innerHTML =
            `

            <div class="porta-pipeline">

                ${pipelineCard(
                    "PLAINTEXT",
                    currentData.originalText
                )}

                <div class="porta-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "ENCRYPT ONCE",
                    currentData.engineCiphertext
                )}

                <div class="porta-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "SAME PORTA OPERATION",
                    recovered
                )}

            </div>


            <div class="porta-rule">
                Encrypting again with the same keyword
                returns the original text.
            </div>

            `;
    }


    /*
    =====================================================
    KEYWORD LOGIC
    =====================================================
    */

    function getPairIndex(
        letter
    ) {

        const alphabetIndex =
            ALPHABET.indexOf(
                letter
            );


        return Math.floor(
            alphabetIndex
            /
            2
        );
    }


    function repeatKeyword(
        keyword,
        length
    ) {

        let result =
            "";


        for (
            let i = 0;
            i < length;
            i++
        ) {

            result +=
                keyword[
                    i
                    %
                    keyword.length
                ];
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

        <div class="porta-pipeline-card">

            <div class="porta-pipeline-label">
                ${label}
            </div>

            <div class="porta-pipeline-value">
                ${value}
            </div>

        </div>

        `;
    }


    function cleanText(
        value
    ) {

        return String(
            value
            ||
            ""
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
            value
            ||
            ""
        )
        .toUpperCase()
        .replace(
            /[^A-Z]/g,
            ""
        );
    }


    /*
    =====================================================
    PUBLIC API
    =====================================================
    */

    return {

        initialize

    };


})();