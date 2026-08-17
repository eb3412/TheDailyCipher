/*
=========================================================
THE DAILY CIPHER
BASIC CIPHER VISUAL TEACHERS
=========================================================

Handles:
- Caesar
- Atbash
- Affine
- Baconian

CipherEngine remains the source of truth for encryption.
=========================================================
*/


const BasicCipherTeacher = (() => {


    const ALPHABET =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


    const SUPPORTED =
        new Set([
            "caesar",
            "atbash",
            "affine",
            "baconian"
        ]);


    let guideID =
        null;


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
            !SUPPORTED.has(
                guide.id
            )
        ) {

            return;
        }


        guideID =
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
            getTeacherTitle();


        document.getElementById(
            "teaching-description"
        ).textContent =
            getTeacherDescription();


        container.innerHTML =
            createHTML();


        setupEvents();

        rebuild();

    }


    /*
    =====================================================
    TITLES
    =====================================================
    */

    function getTeacherTitle() {

        switch (
            guideID
        ) {

            case "caesar":

                return "See a Caesar Shift Letter by Letter";


            case "atbash":

                return "See the Alphabet Reflect in Atbash";


            case "affine":

                return "Build an Affine Cipher From the Equation";


            case "baconian":

                return "Turn Letters Into Baconian A/B Patterns";


            default:

                return "Visual Walkthrough";
        }
    }


    function getTeacherDescription() {

        switch (
            guideID
        ) {

            case "caesar":

                return "Caesar uses one constant shift for the entire message. The two alphabet rows below make that shift visible.";


            case "atbash":

                return "Atbash is a fixed mirror substitution. The alphabet is paired with the same alphabet written backward.";


            case "affine":

                return "Affine performs two mathematical operations on each letter number: multiply by a, then add b, then reduce modulo 26.";


            case "baconian":

                return "Baconian replaces each letter with a five-symbol pattern built from only A and B.";

        }
    }


    /*
    =====================================================
    PAGE HTML
    =====================================================
    */

    function createHTML() {

        switch (
            guideID
        ) {

            case "caesar":

                return createCaesarHTML();


            case "atbash":

                return createAtbashHTML();


            case "affine":

                return createAffineHTML();


            case "baconian":

                return createBaconianHTML();
        }
    }


    /*
    =====================================================
    CAESAR HTML
    =====================================================
    */

    function createCaesarHTML() {

        return `

        <div class="basic-teacher">


            <div class="basic-stage">

                <div class="basic-stage-number">
                    YOUR EXAMPLE
                </div>

                <h3>
                    Choose plaintext and shift
                </h3>


                <div class="basic-input-grid">

                    <div class="basic-input-field">

                        <label for="basic-text">
                            PLAINTEXT
                        </label>

                        <input
                            id="basic-text"
                            type="text"
                            value="HELLO WORLD"
                            maxlength="30"
                        >

                    </div>


                    <div class="basic-input-field">

                        <label for="caesar-shift">
                            SHIFT
                        </label>

                        <input
                            id="caesar-shift"
                            type="number"
                            value="3"
                        >

                    </div>

                </div>

            </div>


            <div class="basic-stage">

                <div class="basic-stage-number">
                    STEP 1
                </div>

                <h3>
                    Shift the entire alphabet
                </h3>

                <p class="basic-stage-description">
                    Every plaintext letter moves by the
                    same amount. Nothing about the shift
                    changes from one letter to the next.
                </p>


                <div
                    id="caesar-alphabet"
                    class="basic-alphabet-scroll"
                >
                </div>

            </div>


            <div class="basic-stage">

                <div class="basic-stage-number">
                    STEP 2
                </div>

                <h3>
                    Follow one letter
                </h3>


                <div id="basic-selected">
                </div>


                ${navigationHTML()}

            </div>


            <div class="basic-stage">

                <div class="basic-stage-number">
                    STEP 3
                </div>

                <h3>
                    Encrypt the whole message
                </h3>

                <div id="basic-full-result">
                </div>

            </div>


        </div>

        `;
    }


    /*
    =====================================================
    ATBASH HTML
    =====================================================
    */

    function createAtbashHTML() {

        return `

        <div class="basic-teacher">


            <div class="basic-stage">

                <div class="basic-stage-number">
                    YOUR EXAMPLE
                </div>

                <h3>
                    Choose plaintext
                </h3>


                <div class="basic-input-grid">

                    <div class="basic-input-field">

                        <label for="basic-text">
                            PLAINTEXT
                        </label>

                        <input
                            id="basic-text"
                            type="text"
                            value="HELLO WORLD"
                            maxlength="30"
                        >

                    </div>

                </div>

            </div>


            <div class="basic-stage">

                <div class="basic-stage-number">
                    STEP 1
                </div>

                <h3>
                    Reverse the alphabet
                </h3>

                <p class="basic-stage-description">
                    A pairs with Z, B with Y, C with X,
                    and the pattern continues inward.
                </p>


                <div class="basic-rule">
                    A ↔ Z, B ↔ Y, C ↔ X
                </div>


                <div
                    id="atbash-alphabet"
                    class="basic-alphabet-scroll"
                >
                </div>

            </div>


            <div class="basic-stage">

                <div class="basic-stage-number">
                    STEP 2
                </div>

                <h3>
                    Follow one letter
                </h3>

                <div id="basic-selected">
                </div>

                ${navigationHTML()}

            </div>


            <div class="basic-stage">

                <div class="basic-stage-number">
                    STEP 3
                </div>

                <h3>
                    Encrypt the whole message
                </h3>

                <div id="basic-full-result">
                </div>

            </div>


        </div>

        `;
    }


    /*
    =====================================================
    AFFINE HTML
    =====================================================
    */

    function createAffineHTML() {

        return `

        <div class="basic-teacher">


            <div class="basic-stage">

                <div class="basic-stage-number">
                    YOUR EXAMPLE
                </div>

                <h3>
                    Choose plaintext and key values
                </h3>


                <div class="basic-input-grid">

                    <div class="basic-input-field">

                        <label for="basic-text">
                            PLAINTEXT
                        </label>

                        <input
                            id="basic-text"
                            type="text"
                            value="AFFINE CIPHER"
                            maxlength="30"
                        >

                    </div>


                    <div class="basic-input-field">

                        <label for="affine-a">
                            MULTIPLIER A
                        </label>

                        <input
                            id="affine-a"
                            type="number"
                            value="5"
                        >

                    </div>


                    <div class="basic-input-field">

                        <label for="affine-b">
                            SHIFT B
                        </label>

                        <input
                            id="affine-b"
                            type="number"
                            value="8"
                        >

                    </div>

                </div>


                <div id="affine-validity">
                </div>

            </div>


            <div class="basic-stage">

                <div class="basic-stage-number">
                    STEP 1
                </div>

                <h3>
                    Convert letters to numbers
                </h3>

                <div class="basic-rule">
                    A=0, B=1, C=2, ... Z=25
                </div>

                <div
                    id="affine-alphabet"
                    class="basic-alphabet-scroll"
                >
                </div>

            </div>


            <div class="basic-stage">

                <div class="basic-stage-number">
                    STEP 2
                </div>

                <h3>
                    Apply E(x) = ax + b mod 26
                </h3>

                <div id="affine-equation-demo">
                </div>

                ${navigationHTML()}

            </div>


            <div class="basic-stage">

                <div class="basic-stage-number">
                    STEP 3
                </div>

                <h3>
                    Encrypt the whole message
                </h3>

                <div id="basic-full-result">
                </div>

            </div>


        </div>

        `;
    }


    /*
    =====================================================
    BACONIAN HTML
    =====================================================
    */

    function createBaconianHTML() {

        return `

        <div class="basic-teacher">


            <div class="basic-stage">

                <div class="basic-stage-number">
                    YOUR EXAMPLE
                </div>

                <h3>
                    Choose plaintext
                </h3>


                <div class="basic-input-grid">

                    <div class="basic-input-field">

                        <label for="basic-text">
                            PLAINTEXT
                        </label>

                        <input
                            id="basic-text"
                            type="text"
                            value="BACON"
                            maxlength="20"
                        >

                    </div>

                </div>

            </div>


            <div class="basic-stage">

                <div class="basic-stage-number">
                    STEP 1
                </div>

                <h3>
                    Each letter gets five A/B symbols
                </h3>

                <p class="basic-stage-description">
                    Five positions, each with two choices,
                    produce enough possible patterns to
                    represent the alphabet.
                </p>


                <div class="basic-rule">
                    AAAAA, AAAAB, AAABA, ...
                </div>


                <div
                    id="baconian-table"
                    class="baconian-table"
                >
                </div>

            </div>


            <div class="basic-stage">

                <div class="basic-stage-number">
                    STEP 2
                </div>

                <h3>
                    Inspect one letter's five-symbol code
                </h3>

                <div id="baconian-selected">
                </div>

                ${navigationHTML()}

            </div>


            <div class="basic-stage">

                <div class="basic-stage-number">
                    STEP 3
                </div>

                <h3>
                    Encode the whole message
                </h3>

                <div id="basic-full-result">
                </div>

            </div>


        </div>

        `;
    }


    function navigationHTML() {

        return `

        <div class="basic-position-controls">

            <button
                id="basic-prev"
                type="button"
                class="basic-position-button"
            >
                ←
            </button>

            <div
                id="basic-position"
                class="basic-position-count"
            >
            </div>

            <button
                id="basic-next"
                type="button"
                class="basic-position-button"
            >
                →
            </button>

        </div>

        `;
    }


    /*
    =====================================================
    EVENTS
    =====================================================
    */

    function setupEvents() {

        const textInput =
            document.getElementById(
                "basic-text"
            );


        if (
            textInput
        ) {

            textInput.addEventListener(
                "input",
                rebuild
            );
        }


        [
            "caesar-shift",
            "affine-a",
            "affine-b"
        ]
        .forEach(
            id => {

                const element =
                    document.getElementById(
                        id
                    );


                if (
                    element
                ) {

                    element.addEventListener(
                        "input",
                        rebuild
                    );
                }

            }
        );


        document
            .getElementById(
                "basic-prev"
            )
            ?.addEventListener(
                "click",
                () => {

                    if (
                        !currentData
                    ) {

                        return;
                    }


                    currentPosition--;


                    if (
                        currentPosition < 0
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
                "basic-next"
            )
            ?.addEventListener(
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

        const text =
            cleanText(
                document
                    .getElementById(
                        "basic-text"
                    )
                    .value
            );


        const letters =
            text.replace(
                /[^A-Z]/g,
                ""
            );


        if (
            !letters
        ) {

            return;
        }


        let parameters =
            {};


        if (
            guideID ===
            "caesar"
        ) {

            parameters.shift =
                Number(
                    document
                        .getElementById(
                            "caesar-shift"
                        )
                        .value
                );

        } else if (
            guideID ===
            "affine"
        ) {

            parameters.a =
                Number(
                    document
                        .getElementById(
                            "affine-a"
                        )
                        .value
                );


            parameters.b =
                Number(
                    document
                        .getElementById(
                            "affine-b"
                        )
                        .value
                );
        }


        const validation =
            CipherEngine
                .validateParameters(
                    guideID,
                    parameters
                );


        currentData = {

            text,

            letters,

            parameters,

            validation

        };


        if (
            currentPosition >=
            letters.length
        ) {

            currentPosition =
                0;
        }


        if (
            guideID ===
            "affine"
        ) {

            renderAffineValidity();
        }


        if (
            !validation.valid
        ) {

            return;
        }


        currentData.ciphertext =
            CipherEngine.encrypt(
                guideID,
                text,
                parameters
            );


        renderSpecific();

        renderSelected();

        renderFullResult();

    }


    /*
    =====================================================
    SPECIFIC RENDER
    =====================================================
    */

    function renderSpecific() {

        switch (
            guideID
        ) {

            case "caesar":

                renderCaesarAlphabet();

                break;


            case "atbash":

                renderAtbashAlphabet();

                break;


            case "affine":

                renderAffineAlphabet();

                break;


            case "baconian":

                renderBaconianTable();

                break;
        }
    }


    /*
    =====================================================
    CAESAR
    =====================================================
    */

    function renderCaesarAlphabet() {

        const shift =
            normalizedMod(
                currentData
                    .parameters
                    .shift,
                26
            );


        const selected =
            currentData
                .letters[
                    currentPosition
                ];


        const container =
            document.getElementById(
                "caesar-alphabet"
            );


        container.innerHTML =
            "";


        const grid =
            document.createElement(
                "div"
            );


        grid.className =
            "basic-alphabet-table";


        for (
            let i = 0;
            i < 26;
            i++
        ) {

            const plain =
                ALPHABET[
                    i
                ];


            const cipher =
                ALPHABET[
                    (
                        i + shift
                    )
                    %
                    26
                ];


            grid.appendChild(
                alphabetCell(
                    plain,
                    cipher,
                    plain === selected
                )
            );
        }


        container.appendChild(
            grid
        );
    }


    /*
    =====================================================
    ATBASH
    =====================================================
    */

    function renderAtbashAlphabet() {

        const selected =
            currentData
                .letters[
                    currentPosition
                ];


        const container =
            document.getElementById(
                "atbash-alphabet"
            );


        container.innerHTML =
            "";


        const grid =
            document.createElement(
                "div"
            );


        grid.className =
            "basic-alphabet-table";


        for (
            let i = 0;
            i < 26;
            i++
        ) {

            const plain =
                ALPHABET[
                    i
                ];


            const cipher =
                ALPHABET[
                    25 - i
                ];


            grid.appendChild(
                alphabetCell(
                    plain,
                    cipher,
                    plain === selected
                )
            );
        }


        container.appendChild(
            grid
        );
    }


    /*
    =====================================================
    AFFINE
    =====================================================
    */

    function renderAffineAlphabet() {

        const selected =
            currentData
                .letters[
                    currentPosition
                ];


        const container =
            document.getElementById(
                "affine-alphabet"
            );


        container.innerHTML =
            "";


        const grid =
            document.createElement(
                "div"
            );


        grid.className =
            "basic-alphabet-table";


        for (
            let i = 0;
            i < 26;
            i++
        ) {

            grid.appendChild(
                alphabetCell(
                    ALPHABET[i],
                    i,
                    ALPHABET[i]
                    ===
                    selected
                )
            );
        }


        container.appendChild(
            grid
        );
    }


    function renderAffineValidity() {

        const container =
            document.getElementById(
                "affine-validity"
            );


        const validation =
            currentData
                .validation;


        if (
            validation.valid
        ) {

            container.innerHTML =
                `
                <div class="basic-rule affine-valid">
                    ✓ This Affine key is reversible modulo 26.
                </div>
                `;

        } else {

            container.innerHTML =
                `
                <div class="basic-rule affine-invalid">
                    ✕ ${escapeHTML(
                        validation.message
                    )}
                </div>
                `;
        }
    }


    /*
    =====================================================
    BACONIAN
    =====================================================
    */

    function renderBaconianTable() {

        const container =
            document.getElementById(
                "baconian-table"
            );


        container.innerHTML =
            "";


        const selected =
            currentData
                .letters[
                    currentPosition
                ];


        for (
            let i = 0;
            i < 26;
            i++
        ) {

            const letter =
                ALPHABET[i];


            const code =
                baconianCode(
                    i
                );


            const cell =
                document.createElement(
                    "div"
                );


            cell.className =
                "baconian-cell";


            if (
                letter ===
                selected
            ) {

                cell.classList.add(
                    "highlighted"
                );
            }


            cell.innerHTML =
                `

                <span class="baconian-letter">
                    ${letter}
                </span>

                <span class="baconian-code">
                    ${code}
                </span>

                `;


            container.appendChild(
                cell
            );
        }
    }


    /*
    =====================================================
    SELECTED LETTER
    =====================================================
    */

    function renderSelected() {

        if (
            !currentData
            ||
            !currentData.validation.valid
        ) {

            return;
        }


        const letter =
            currentData
                .letters[
                    currentPosition
                ];


        switch (
            guideID
        ) {

            case "caesar":

                renderSelectedCaesar(
                    letter
                );

                renderCaesarAlphabet();

                break;


            case "atbash":

                renderSelectedAtbash(
                    letter
                );

                renderAtbashAlphabet();

                break;


            case "affine":

                renderSelectedAffine(
                    letter
                );

                renderAffineAlphabet();

                break;


            case "baconian":

                renderSelectedBaconian(
                    letter
                );

                renderBaconianTable();

                break;
        }


        document.getElementById(
            "basic-position"
        ).textContent =
            `Letter ${currentPosition + 1} of ${currentData.letters.length}`;
    }


    function renderSelectedCaesar(
        letter
    ) {

        const cipher =
            CipherEngine.encrypt(
                "caesar",
                letter,
                currentData.parameters
            );


        const shift =
            currentData
                .parameters
                .shift;


        document.getElementById(
            "basic-selected"
        ).innerHTML =
            `

            <div class="basic-pipeline">

                ${pipelineCard(
                    "PLAINTEXT",
                    letter
                )}

                <div class="basic-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "SHIFT",
                    formatSigned(
                        shift
                    )
                )}

                <div class="basic-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "CIPHERTEXT",
                    cipher
                )}

            </div>

            `;
    }


    function renderSelectedAtbash(
        letter
    ) {

        const cipher =
            CipherEngine.encrypt(
                "atbash",
                letter,
                {}
            );


        const position =
            ALPHABET.indexOf(
                letter
            )
            +
            1;


        const mirroredPosition =
            27 - position;


        document.getElementById(
            "basic-selected"
        ).innerHTML =
            `

            <div class="basic-pipeline">

                ${pipelineCard(
                    "PLAINTEXT",
                    letter
                )}

                <div class="basic-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "POSITION",
                    position
                )}

                <div class="basic-pipeline-arrow">
                    ↔
                </div>

                ${pipelineCard(
                    "MIRRORED POSITION",
                    mirroredPosition
                )}

                <div class="basic-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "CIPHERTEXT",
                    cipher
                )}

            </div>

            `;
    }


    function renderSelectedAffine(
        letter
    ) {

        const x =
            ALPHABET.indexOf(
                letter
            );


        const a =
            currentData
                .parameters
                .a;


        const b =
            currentData
                .parameters
                .b;


        const multiplied =
            a * x;


        const added =
            multiplied + b;


        const reduced =
            normalizedMod(
                added,
                26
            );


        const output =
            ALPHABET[
                reduced
            ];


        document.getElementById(
            "affine-equation-demo"
        ).innerHTML =
            `

            <div class="basic-pipeline">

                ${pipelineCard(
                    "LETTER",
                    letter
                )}

                <div class="basic-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "x",
                    x
                )}

                <div class="basic-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "ax",
                    `${a} × ${x} = ${multiplied}`
                )}

                <div class="basic-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "ax + b",
                    `${multiplied} + ${b} = ${added}`
                )}

                <div class="basic-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "MOD 26",
                    reduced
                )}

                <div class="basic-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "CIPHERTEXT",
                    output
                )}

            </div>


            <div class="affine-equations">

                <div class="affine-equation">

                    <div class="affine-equation-main">
                        E(${x})
                        =
                        (${a} × ${x} + ${b})
                        mod 26
                        =
                        ${reduced}
                    </div>

                    <div class="affine-equation-note">
                        ${reduced}
                        corresponds to
                        ${output}.
                    </div>

                </div>

            </div>

            `;
    }


    function renderSelectedBaconian(
        letter
    ) {

        const index =
            ALPHABET.indexOf(
                letter
            );


        const code =
            baconianCode(
                index
            );


        const bits =
            [
                ...code
            ]
            .map(
                symbol =>
                    `

                    <div class="baconian-bit ${symbol.toLowerCase()}">
                        ${symbol}
                    </div>

                    `
            )
            .join("");


        document.getElementById(
            "baconian-selected"
        ).innerHTML =
            `

            <div class="basic-pipeline">

                ${pipelineCard(
                    "LETTER",
                    letter
                )}

                <div class="basic-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "ALPHABET INDEX",
                    index
                )}

                <div class="basic-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "A/B PATTERN",
                    code
                )}

            </div>


            <div class="baconian-bit-row">
                ${bits}
            </div>

            `;
    }


    /*
    =====================================================
    FULL RESULT
    =====================================================
    */

    function renderFullResult() {

        document.getElementById(
            "basic-full-result"
        ).innerHTML =
            `

            <div class="basic-pipeline">

                ${pipelineCard(
                    "PLAINTEXT",
                    currentData.text
                )}

                <div class="basic-pipeline-arrow">
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
    CELL
    =====================================================
    */

    function alphabetCell(
        top,
        main,
        highlighted
    ) {

        const cell =
            document.createElement(
                "div"
            );


        cell.className =
            "basic-alpha-cell";


        if (
            highlighted
        ) {

            cell.classList.add(
                "highlighted"
            );
        }


        const topElement =
            document.createElement(
                "span"
            );


        topElement.className =
            "basic-alpha-top";


        topElement.textContent =
            top;


        const mainElement =
            document.createElement(
                "span"
            );


        mainElement.className =
            "basic-alpha-main";


        mainElement.textContent =
            main;


        cell.appendChild(
            topElement
        );


        cell.appendChild(
            mainElement
        );


        return cell;
    }


    /*
    =====================================================
    BACONIAN CODE
    =====================================================
    */

    function baconianCode(
        index
    ) {

        return index
            .toString(
                2
            )
            .padStart(
                5,
                "0"
            )
            .replace(
                /0/g,
                "A"
            )
            .replace(
                /1/g,
                "B"
            );
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

        <div class="basic-pipeline-card">

            <div class="basic-pipeline-label">
                ${escapeHTML(
                    label
                )}
            </div>

            <div class="basic-pipeline-value">
                ${escapeHTML(
                    value
                )}
            </div>

        </div>

        `;
    }


    function normalizedMod(
        value,
        modulus
    ) {

        return (
            (
                Number(
                    value
                )
                %
                modulus
            )
            +
            modulus
        )
        %
        modulus;
    }


    function formatSigned(
        value
    ) {

        const number =
            Number(
                value
            );


        return number >= 0
            ?
            `+${number}`
            :
            `${number}`;
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


    function escapeHTML(
        value
    ) {

        return String(
            value
            ??
            ""
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


    /*
    =====================================================
    PUBLIC
    =====================================================
    */

    return {

        initialize

    };


})();