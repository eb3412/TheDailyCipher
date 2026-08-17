/*
=========================================================
THE DAILY CIPHER
HILL CIPHER VISUAL TEACHER
=========================================================
*/


const HillTeacher = (() => {


    const ALPHABET =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


    let currentBlock =
        0;


    let currentData =
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
            guide.id !==
            "hill"
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
            "Build a Hill Cipher From Scratch";


        document.getElementById(
            "teaching-description"
        ).textContent =
            "The Hill cipher sounds difficult because it uses matrices, but encryption is really a repeated sequence: turn letters into numbers, multiply two small equations, reduce the answers modulo 26, and turn the numbers back into letters.";


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

        <div class="hill-teacher">


            <!-- ========================================
                 CONTROLS
            ========================================= -->

            <div class="hill-stage">

                <div class="hill-stage-number">
                    YOUR EXAMPLE
                </div>

                <h3>
                    Choose the plaintext and matrix
                </h3>

                <p class="hill-stage-description">
                    This walkthrough uses a 2x2 matrix so
                    every operation can be seen clearly.
                </p>


                <div class="hill-input-grid">

                    <div class="hill-input-field">

                        <label for="hill-teacher-text">
                            PLAINTEXT
                        </label>

                        <input
                            id="hill-teacher-text"
                            type="text"
                            value="HELP"
                            maxlength="16"
                            autocomplete="off"
                        >

                    </div>


                    <div class="hill-input-field">

                        <label for="hill-teacher-matrix">
                            MATRIX
                        </label>

                        <input
                            id="hill-teacher-matrix"
                            type="text"
                            value="3,3;2,5"
                            autocomplete="off"
                        >

                    </div>

                </div>

            </div>


            <!-- ========================================
                 STEP 1
            ========================================= -->

            <div class="hill-stage">

                <div class="hill-stage-number">
                    STEP 1
                </div>

                <h3>
                    Give every letter a number
                </h3>

                <p class="hill-stage-description">
                    Hill arithmetic needs numbers rather
                    than letters. We use A=0, B=1, C=2,
                    continuing through Z=25.
                </p>


                <div class="hill-rule">
                    A = 0, B = 1, C = 2, ... Z = 25
                </div>


                <div
                    id="hill-alphabet"
                    class="hill-alphabet-strip"
                >
                </div>

            </div>


            <!-- ========================================
                 STEP 2
            ========================================= -->

            <div class="hill-stage">

                <div class="hill-stage-number">
                    STEP 2
                </div>

                <h3>
                    Split the plaintext into blocks
                </h3>

                <p class="hill-stage-description">
                    Because this matrix is 2x2, it operates
                    on two plaintext letters at a time.
                    HELP therefore becomes HE and LP.
                </p>


                <div
                    id="hill-blocks"
                    class="hill-blocks"
                >
                </div>

            </div>


            <!-- ========================================
                 STEP 3
            ========================================= -->

            <div class="hill-stage">

                <div class="hill-stage-number">
                    STEP 3
                </div>

                <h3>
                    Convert one block into a vector
                </h3>

                <p class="hill-stage-description">
                    A vector is just the two plaintext
                    numbers written vertically. For HE,
                    H=7 and E=4, so the vector is [7,4].
                </p>


                <div
                    id="hill-vector-demo"
                >
                </div>

            </div>


            <!-- ========================================
                 STEP 4
            ========================================= -->

            <div class="hill-stage">

                <div class="hill-stage-number">
                    STEP 4
                </div>

                <h3>
                    Multiply the matrix by the vector
                </h3>

                <p class="hill-stage-description">
                    Each row of the matrix creates one new
                    number. Multiply matching positions,
                    then add the products.
                </p>


                <div
                    id="hill-multiplication"
                >
                </div>

            </div>


            <!-- ========================================
                 STEP 5
            ========================================= -->

            <div class="hill-stage">

                <div class="hill-stage-number">
                    STEP 5
                </div>

                <h3>
                    Reduce the answers modulo 26
                </h3>

                <p class="hill-stage-description">
                    Letter numbers must stay between 0 and
                    25. Modulo 26 means keep the remainder
                    after dividing by 26.
                </p>


                <div class="hill-rule">
                    result mod 26 = remainder after division by 26
                </div>


                <div
                    id="hill-mod-demo"
                >
                </div>

            </div>


            <!-- ========================================
                 STEP 6
            ========================================= -->

            <div class="hill-stage">

                <div class="hill-stage-number">
                    STEP 6
                </div>

                <h3>
                    Turn the result back into letters
                </h3>

                <div
                    id="hill-letter-result"
                >
                </div>


                <div class="hill-position-controls">

                    <button
                        id="hill-prev"
                        type="button"
                        class="hill-position-button"
                    >
                        ←
                    </button>

                    <div
                        id="hill-position"
                        class="hill-position-count"
                    >
                    </div>

                    <button
                        id="hill-next"
                        type="button"
                        class="hill-position-button"
                    >
                        →
                    </button>

                </div>

            </div>


            <!-- ========================================
                 STEP 7
            ========================================= -->

            <div class="hill-stage">

                <div class="hill-stage-number">
                    STEP 7
                </div>

                <h3>
                    See the whole message
                </h3>

                <p class="hill-stage-description">
                    Repeat the same matrix multiplication
                    independently for every two-letter
                    block.
                </p>


                <div
                    id="hill-full-pipeline"
                >
                </div>

            </div>


            <!-- ========================================
                 DECRYPTION CONCEPT
            ========================================= -->

            <div class="hill-stage">

                <div class="hill-stage-number">
                    DECRYPTION
                </div>

                <h3>
                    How do you reverse it?
                </h3>

                <p class="hill-stage-description">
                    Ordinary division cannot undo matrix
                    multiplication. Instead, Hill
                    decryption uses the inverse of the key
                    matrix modulo 26.
                </p>


                <div class="hill-rule">
                    plaintext vector =
                    inverse key matrix x ciphertext vector
                    mod 26
                </div>


                <p class="hill-stage-description">
                    This is why the key matrix cannot be
                    arbitrary. It must have an inverse
                    modulo 26. If no inverse exists, the
                    encryption cannot be uniquely reversed.
                </p>

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
            "hill-teacher-text",
            "hill-teacher-matrix"
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
                "hill-prev"
            )
            .addEventListener(
                "click",
                () => {

                    if (
                        !currentData
                    ) {

                        return;
                    }


                    currentBlock--;


                    if (
                        currentBlock <
                        0
                    ) {

                        currentBlock =
                            currentData
                                .blocks
                                .length
                            -
                            1;
                    }


                    renderCurrentBlock();

                }
            );


        document
            .getElementById(
                "hill-next"
            )
            .addEventListener(
                "click",
                () => {

                    if (
                        !currentData
                    ) {

                        return;
                    }


                    currentBlock =
                        (
                            currentBlock
                            +
                            1
                        )
                        %
                        currentData
                            .blocks
                            .length;


                    renderCurrentBlock();

                }
            );

    }


    /*
    =====================================================
    BUILD DATA
    =====================================================
    */

    function rebuild() {

        let plaintext =
            cleanLetters(
                document
                    .getElementById(
                        "hill-teacher-text"
                    )
                    .value
            );


        if (
            !plaintext
        ) {

            return;
        }


        /*
        Pad odd-length text with X.
        */

        if (
            plaintext.length
            %
            2
            !==
            0
        ) {

            plaintext +=
                "X";
        }


        let matrix;


        try {

            matrix =
                parseMatrix(
                    document
                        .getElementById(
                            "hill-teacher-matrix"
                        )
                        .value
                );

        } catch (
            error
        ) {

            return;
        }


        if (
            !isValidMatrix(
                matrix
            )
        ) {

            return;
        }


        const blocks =
            [];


        for (
            let i = 0;
            i < plaintext.length;
            i += 2
        ) {

            const letters =
                plaintext.slice(
                    i,
                    i + 2
                );


            const vector =
                [
                    letterNumber(
                        letters[0]
                    ),

                    letterNumber(
                        letters[1]
                    )
                ];


            const raw =
                multiplyMatrixVector(
                    matrix,
                    vector
                );


            const reduced =
                raw.map(
                    value =>
                        mod(
                            value,
                            26
                        )
                );


            const ciphertext =
                reduced
                    .map(
                        number =>
                            ALPHABET[
                                number
                            ]
                    )
                    .join("");


            blocks.push({

                letters,

                vector,

                raw,

                reduced,

                ciphertext

            });
        }


        currentData = {

            plaintext,

            matrix,

            blocks,

            ciphertext:
                blocks
                    .map(
                        block =>
                            block.ciphertext
                    )
                    .join("")

        };


        if (
            currentBlock >=
            blocks.length
        ) {

            currentBlock =
                0;
        }


        renderAlphabet();

        renderBlocks();

        renderCurrentBlock();

        renderFullPipeline();

    }


    /*
    =====================================================
    ALPHABET
    =====================================================
    */

    function renderAlphabet() {

        const container =
            document.getElementById(
                "hill-alphabet"
            );


        container.innerHTML =
            "";


        for (
            let i = 0;
            i < 26;
            i++
        ) {

            const cell =
                document.createElement(
                    "div"
                );


            cell.className =
                "hill-alphabet-cell";


            cell.dataset.letter =
                ALPHABET[i];


            const letter =
                document.createElement(
                    "span"
                );


            letter.className =
                "hill-alphabet-letter";


            letter.textContent =
                ALPHABET[i];


            const number =
                document.createElement(
                    "span"
                );


            number.className =
                "hill-alphabet-number";


            number.textContent =
                i;


            cell.appendChild(
                letter
            );


            cell.appendChild(
                number
            );


            container.appendChild(
                cell
            );
        }
    }


    /*
    =====================================================
    BLOCKS
    =====================================================
    */

    function renderBlocks() {

        const container =
            document.getElementById(
                "hill-blocks"
            );


        container.innerHTML =
            "";


        currentData.blocks.forEach(
            (
                block,
                index
            ) => {

                const element =
                    document.createElement(
                        "button"
                    );


                element.type =
                    "button";


                element.className =
                    "hill-block";


                element.textContent =
                    block.letters;


                if (
                    index ===
                    currentBlock
                ) {

                    element.classList.add(
                        "active"
                    );
                }


                element.addEventListener(
                    "click",
                    () => {

                        currentBlock =
                            index;


                        renderCurrentBlock();

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
    CURRENT BLOCK
    =====================================================
    */

    function renderCurrentBlock() {

        const block =
            currentData
                .blocks[
                    currentBlock
                ];


        highlightLetters(
            block.letters
        );


        highlightActiveBlock();


        renderVectorDemo(
            block
        );


        renderMultiplication(
            block
        );


        renderModulo(
            block
        );


        renderLetterResult(
            block
        );


        document.getElementById(
            "hill-position"
        ).textContent =
            `Block ${currentBlock + 1} of ${currentData.blocks.length}`;
    }


    /*
    =====================================================
    HIGHLIGHTS
    =====================================================
    */

    function highlightLetters(
        letters
    ) {

        document
            .querySelectorAll(
                ".hill-alphabet-cell"
            )
            .forEach(
                cell => {

                    cell.classList.toggle(
                        "highlighted",
                        letters.includes(
                            cell.dataset.letter
                        )
                    );

                }
            );
    }


    function highlightActiveBlock() {

        document
            .querySelectorAll(
                ".hill-block"
            )
            .forEach(
                (
                    element,
                    index
                ) => {

                    element.classList.toggle(
                        "active",
                        index
                        ===
                        currentBlock
                    );

                }
            );
    }


    /*
    =====================================================
    VECTOR DEMO
    =====================================================
    */

    function renderVectorDemo(
        block
    ) {

        const container =
            document.getElementById(
                "hill-vector-demo"
            );


        container.innerHTML =
            `

            <div class="hill-pipeline">

                ${pipelineCard(
                    "LETTERS",
                    block.letters
                )}

                <div class="hill-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "NUMBERS",
                    `${block.vector[0]}, ${block.vector[1]}`
                )}

                <div class="hill-pipeline-arrow">
                    →
                </div>

                <div class="hill-vector">

                    ${vectorCell(
                        block.vector[0]
                    )}

                    ${vectorCell(
                        block.vector[1]
                    )}

                </div>

            </div>

            `;
    }


    /*
    =====================================================
    MULTIPLICATION
    =====================================================
    */

    function renderMultiplication(
        block
    ) {

        const matrix =
            currentData.matrix;


        const x =
            block.vector[0];


        const y =
            block.vector[1];


        const first =
            block.raw[0];


        const second =
            block.raw[1];


        document.getElementById(
            "hill-multiplication"
        ).innerHTML =
            `

            <div class="hill-matrix-area">

                ${matrixHTML(
                    matrix
                )}

                <div class="hill-math-symbol">
                    x
                </div>

                <div class="hill-vector">

                    ${vectorCell(x)}

                    ${vectorCell(y)}

                </div>

                <div class="hill-math-symbol">
                    =
                </div>

                <div class="hill-vector">

                    ${vectorCell(first)}

                    ${vectorCell(second)}

                </div>

            </div>


            <div class="hill-equations">

                <div class="hill-equation">

                    <div class="hill-equation-main">

                        First output:

                        (${matrix[0][0]} x ${x})
                        +
                        (${matrix[0][1]} x ${y})

                        =
                        ${first}

                    </div>

                </div>


                <div class="hill-equation">

                    <div class="hill-equation-main">

                        Second output:

                        (${matrix[1][0]} x ${x})
                        +
                        (${matrix[1][1]} x ${y})

                        =
                        ${second}

                    </div>

                </div>

            </div>

            `;
    }


    /*
    =====================================================
    MODULO
    =====================================================
    */

    function renderModulo(
        block
    ) {

        const rawA =
            block.raw[0];


        const rawB =
            block.raw[1];


        const reducedA =
            block.reduced[0];


        const reducedB =
            block.reduced[1];


        document.getElementById(
            "hill-mod-demo"
        ).innerHTML =
            `

            <div class="hill-equations">

                <div class="hill-equation">

                    <div class="hill-equation-main">
                        ${rawA} mod 26
                    </div>

                    <div class="hill-equation-reduction">
                        remainder after dividing ${rawA}
                        by 26
                    </div>

                    <div class="hill-equation-result">
                        = ${reducedA}
                    </div>

                </div>


                <div class="hill-equation">

                    <div class="hill-equation-main">
                        ${rawB} mod 26
                    </div>

                    <div class="hill-equation-reduction">
                        remainder after dividing ${rawB}
                        by 26
                    </div>

                    <div class="hill-equation-result">
                        = ${reducedB}
                    </div>

                </div>

            </div>

            `;
    }


    /*
    =====================================================
    LETTER RESULT
    =====================================================
    */

    function renderLetterResult(
        block
    ) {

        const letterA =
            ALPHABET[
                block.reduced[0]
            ];


        const letterB =
            ALPHABET[
                block.reduced[1]
            ];


        document.getElementById(
            "hill-letter-result"
        ).innerHTML =
            `

            <div class="hill-pipeline">

                ${pipelineCard(
                    "REDUCED VECTOR",
                    `${block.reduced[0]}, ${block.reduced[1]}`
                )}

                <div class="hill-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "LETTERS",
                    `${letterA}${letterB}`
                )}

            </div>

            `;
    }


    /*
    =====================================================
    WHOLE MESSAGE
    =====================================================
    */

    function renderFullPipeline() {

        const container =
            document.getElementById(
                "hill-full-pipeline"
            );


        const blockFlow =
            currentData
                .blocks
                .map(
                    block =>
                        `
                        <div class="hill-pipeline">

                            ${pipelineCard(
                                "PLAINTEXT",
                                block.letters
                            )}

                            <div class="hill-pipeline-arrow">
                                →
                            </div>

                            ${pipelineCard(
                                "VECTOR",
                                `[${block.vector.join(", ")}]`
                            )}

                            <div class="hill-pipeline-arrow">
                                →
                            </div>

                            ${pipelineCard(
                                "MOD 26",
                                `[${block.reduced.join(", ")}]`
                            )}

                            <div class="hill-pipeline-arrow">
                                →
                            </div>

                            ${pipelineCard(
                                "CIPHERTEXT",
                                block.ciphertext
                            )}

                        </div>
                        `
                )
                .join("");


        container.innerHTML =
            `

            ${blockFlow}

            <div class="hill-rule">
                FINAL CIPHERTEXT:
                ${currentData.ciphertext}
            </div>

            `;
    }


    /*
    =====================================================
    HTML HELPERS
    =====================================================
    */

    function matrixHTML(
        matrix
    ) {

        return `

        <div class="hill-matrix">

            ${matrixCell(
                matrix[0][0]
            )}

            ${matrixCell(
                matrix[0][1]
            )}

            ${matrixCell(
                matrix[1][0]
            )}

            ${matrixCell(
                matrix[1][1]
            )}

        </div>

        `;
    }


    function matrixCell(
        value
    ) {

        return `

        <div class="hill-matrix-cell">
            ${value}
        </div>

        `;
    }


    function vectorCell(
        value
    ) {

        return `

        <div class="hill-vector-cell">
            ${value}
        </div>

        `;
    }


    function pipelineCard(
        label,
        value
    ) {

        return `

        <div class="hill-pipeline-card">

            <div class="hill-pipeline-label">
                ${label}
            </div>

            <div class="hill-pipeline-value">
                ${value}
            </div>

        </div>

        `;
    }


    /*
    =====================================================
    MATH
    =====================================================
    */

    function multiplyMatrixVector(
        matrix,
        vector
    ) {

        return [

            (
                matrix[0][0]
                *
                vector[0]
            )
            +
            (
                matrix[0][1]
                *
                vector[1]
            ),

            (
                matrix[1][0]
                *
                vector[0]
            )
            +
            (
                matrix[1][1]
                *
                vector[1]
            )

        ];
    }


    function mod(
        value,
        modulus
    ) {

        return (
            (
                value
                %
                modulus
            )
            +
            modulus
        )
        %
        modulus;
    }


    /*
    =====================================================
    MATRIX PARSER
    =====================================================
    */

    function parseMatrix(
        input
    ) {

        const matrix =
            String(
                input
            )
            .split(";")
            .map(
                row =>
                    row
                        .split(",")
                        .map(
                            value =>
                                Number(
                                    value.trim()
                                )
                        )
            );


        if (
            !isValidMatrix(
                matrix
            )
        ) {

            throw new Error(
                "Use a 2x2 matrix like 3,3;2,5"
            );
        }


        return matrix;
    }


    function isValidMatrix(
        matrix
    ) {

        return (

            Array.isArray(
                matrix
            )

            &&

            matrix.length
            ===
            2

            &&

            matrix.every(
                row =>
                    Array.isArray(
                        row
                    )
                    &&
                    row.length
                    ===
                    2
                    &&
                    row.every(
                        Number.isFinite
                    )
            )

        );
    }


    /*
    =====================================================
    LETTERS
    =====================================================
    */

    function letterNumber(
        letter
    ) {

        return ALPHABET
            .indexOf(
                letter
            );
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
    PUBLIC
    =====================================================
    */

    return {

        initialize

    };


})();