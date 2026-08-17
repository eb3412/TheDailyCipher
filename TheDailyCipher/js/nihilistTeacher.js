/*
=========================================================
THE DAILY CIPHER
NIHILIST VISUAL TEACHER
=========================================================
*/


const NihilistTeacher = (() => {


    let currentPosition =
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
            "nihilist"
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
            "Build a Nihilist Cipher From Scratch";


        document.getElementById(
            "teaching-description"
        ).textContent =
            "Nihilist looks complicated because several simple operations are stacked together. This walkthrough separates those operations so you can see exactly where every ciphertext number comes from.";


        container.innerHTML =
            createTeacherHTML();


        setupEvents();

        rebuild();

    }


    /*
    =====================================================
    HTML
    =====================================================
    */

    function createTeacherHTML() {

        return `

        <div class="nihilist-teacher">


            <!-- ========================================
                 CONTROLS
            ========================================= -->

            <div class="nihilist-stage">

                <div class="nihilist-stage-number">
                    YOUR EXAMPLE
                </div>

                <h3>
                    Choose the message and keys
                </h3>

                <p class="nihilist-stage-description">
                    Change these values at any time.
                    The entire walkthrough will rebuild
                    automatically.
                </p>


                <div class="nihilist-input-grid">


                    <div class="nihilist-input-field">

                        <label for="teacher-plaintext">
                            PLAINTEXT
                        </label>

                        <input
                            id="teacher-plaintext"
                            type="text"
                            value="HELLO"
                            maxlength="12"
                            autocomplete="off"
                        >

                    </div>


                    <div class="nihilist-input-field">

                        <label for="teacher-square-key">
                            SQUARE KEYWORD
                        </label>

                        <input
                            id="teacher-square-key"
                            type="text"
                            value="CIPHER"
                            maxlength="20"
                            autocomplete="off"
                        >

                    </div>


                    <div class="nihilist-input-field">

                        <label for="teacher-additive-key">
                            ADDITIVE KEYWORD
                        </label>

                        <input
                            id="teacher-additive-key"
                            type="text"
                            value="SECRET"
                            maxlength="20"
                            autocomplete="off"
                        >

                    </div>


                </div>

            </div>


            <!-- ========================================
                 STAGE 1
            ========================================= -->

            <div class="nihilist-stage">

                <div class="nihilist-stage-number">
                    STEP 1
                </div>

                <h3>
                    Build the Polybius Square
                </h3>

                <p class="nihilist-stage-description">
                    Think of a Polybius square as an
                    address book for letters. Every letter
                    gets a row number and a column number.
                    Those two digits become that letter's
                    coordinate.
                </p>


                <div class="nihilist-rule">
                    coordinate = row digit + column digit
                </div>


                <div
                    id="teacher-polybius"
                    class="polybius-wrapper"
                >
                </div>


                <div class="coordinate-demo">

                    <div class="coordinate-demo-title">
                        SELECTED PLAINTEXT LETTER
                    </div>

                    <div
                        id="teacher-coordinate-demo"
                        class="coordinate-result"
                    >
                    </div>

                </div>

            </div>


            <!-- ========================================
                 STAGE 2
            ========================================= -->

            <div class="nihilist-stage">

                <div class="nihilist-stage-number">
                    STEP 2
                </div>

                <h3>
                    Turn the plaintext into numbers
                </h3>

                <p class="nihilist-stage-description">
                    Now we simply look up every plaintext
                    letter in the square. Nothing has been
                    added yet. At this stage we are only
                    replacing letters with their addresses.
                </p>


                <div
                    id="teacher-plaintext-table"
                    class="nihilist-alignment"
                >
                </div>

            </div>


            <!-- ========================================
                 STAGE 3
            ========================================= -->

            <div class="nihilist-stage">

                <div class="nihilist-stage-number">
                    STEP 3
                </div>

                <h3>
                    Repeat the additive keyword
                </h3>

                <p class="nihilist-stage-description">
                    The second keyword acts like a repeating
                    numerical key. Repeat it until there is
                    one key letter beneath every plaintext
                    letter, then convert those key letters
                    through the same Polybius square.
                </p>


                <div
                    id="teacher-key-table"
                    class="nihilist-alignment"
                >
                </div>

            </div>


            <!-- ========================================
                 STAGE 4
            ========================================= -->

            <div class="nihilist-stage">

                <div class="nihilist-stage-number">
                    STEP 4
                </div>

                <h3>
                    Add one position at a time
                </h3>

                <p class="nihilist-stage-description">
                    This is the actual encryption step.
                    Choose a position below and inspect the
                    exact arithmetic used to create its
                    ciphertext number.
                </p>


                <div
                    id="teacher-equation"
                    class="nihilist-equation"
                >
                </div>


                <div class="nihilist-position-controls">

                    <button
                        id="teacher-prev"
                        type="button"
                        class="nihilist-position-button"
                    >
                        ←
                    </button>

                    <div
                        id="teacher-position"
                        class="nihilist-position-count"
                    >
                    </div>

                    <button
                        id="teacher-next"
                        type="button"
                        class="nihilist-position-button"
                    >
                        →
                    </button>

                </div>

            </div>


            <!-- ========================================
                 STAGE 5
            ========================================= -->

            <div class="nihilist-stage">

                <div class="nihilist-stage-number">
                    STEP 5
                </div>

                <h3>
                    Put the whole encryption together
                </h3>

                <p class="nihilist-stage-description">
                    Each column below is independent:
                    plaintext coordinate plus additive-key
                    coordinate equals one ciphertext number.
                </p>


                <div
                    id="teacher-full-table"
                    class="nihilist-alignment"
                >
                </div>

            </div>


            <!-- ========================================
                 STAGE 6
            ========================================= -->

            <div class="nihilist-stage">

                <div class="nihilist-stage-number">
                    STEP 6
                </div>

                <h3>
                    Decryption is the same process backward
                </h3>


                <div class="nihilist-decrypt-box">

                    <p>
                        Encryption ended by adding the key
                        coordinate. Therefore decryption
                        begins by subtracting it.
                    </p>


                    <div class="nihilist-rule">
                        ciphertext − key coordinate
                        = plaintext coordinate
                    </div>


                    <div
                        id="teacher-decrypt-example"
                    >
                    </div>

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
            "teacher-plaintext",
            "teacher-square-key",
            "teacher-additive-key"
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
                "teacher-prev"
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
                        currentPosition < 0
                    ) {

                        currentPosition =
                            currentData
                                .plaintext
                                .length
                            -
                            1;
                    }


                    renderSelectedPosition();

                }
            );


        document
            .getElementById(
                "teacher-next"
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
                            .plaintext
                            .length;


                    renderSelectedPosition();

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
            cleanLetters(
                document
                    .getElementById(
                        "teacher-plaintext"
                    )
                    .value
            )
            .replace(
                /J/g,
                "I"
            );


        const squareKeyword =
            cleanLetters(
                document
                    .getElementById(
                        "teacher-square-key"
                    )
                    .value
            )
            .replace(
                /J/g,
                "I"
            );


        const additiveKeyword =
            cleanLetters(
                document
                    .getElementById(
                        "teacher-additive-key"
                    )
                    .value
            )
            .replace(
                /J/g,
                "I"
            );


        if (
            !plaintext
            ||
            !additiveKeyword
        ) {

            return;
        }


        const square =
            buildSquare(
                squareKeyword
            );


        const lookup =
            createLookup(
                square
            );


        const repeatedKey =
            repeatKeyword(
                additiveKeyword,
                plaintext.length
            );


        const plaintextCoordinates =
            [
                ...plaintext
            ]
            .map(
                letter =>
                    lookup[
                        letter
                    ]
            );


        const keyCoordinates =
            [
                ...repeatedKey
            ]
            .map(
                letter =>
                    lookup[
                        letter
                    ]
            );


        const ciphertext =
            plaintextCoordinates
                .map(
                    (
                        coordinate,
                        index
                    ) =>
                        coordinate
                        +
                        keyCoordinates[
                            index
                        ]
                );


        currentData = {

            plaintext,

            squareKeyword,

            additiveKeyword,

            square,

            lookup,

            repeatedKey,

            plaintextCoordinates,

            keyCoordinates,

            ciphertext

        };


        if (
            currentPosition >=
            plaintext.length
        ) {

            currentPosition =
                0;
        }


        renderSquare();

        renderPlaintextTable();

        renderKeyTable();

        renderFullTable();

        renderSelectedPosition();

        renderDecryptExample();

    }


    /*
    =====================================================
    SQUARE
    =====================================================
    */

    function buildSquare(
        keyword
    ) {

        const alphabet =
            "ABCDEFGHIKLMNOPQRSTUVWXYZ";


        const combined =
            keyword
            +
            alphabet;


        const unique =
            [];


        for (
            const letter
            of combined
        ) {

            if (
                !unique.includes(
                    letter
                )
            ) {

                unique.push(
                    letter
                );
            }
        }


        return unique.slice(
            0,
            25
        );
    }


    function createLookup(
        square
    ) {

        const lookup =
            {};


        square.forEach(
            (
                letter,
                index
            ) => {

                const row =
                    Math.floor(
                        index
                        /
                        5
                    )
                    +
                    1;


                const column =
                    (
                        index
                        %
                        5
                    )
                    +
                    1;


                const coordinate =
                    row
                    *
                    10
                    +
                    column;


                lookup[
                    letter
                ] =
                    coordinate;


                if (
                    letter ===
                    "I"
                ) {

                    lookup.J =
                        coordinate;
                }

            }
        );


        return lookup;
    }


    /*
    =====================================================
    RENDER SQUARE
    =====================================================
    */

    function renderSquare() {

        const container =
            document.getElementById(
                "teacher-polybius"
            );


        container.innerHTML =
            "";


        const grid =
            document.createElement(
                "div"
            );


        grid.className =
            "polybius-layout";


        /*
        Corner
        */

        const corner =
            document.createElement(
                "div"
            );


        corner.className =
            "polybius-corner";


        corner.textContent =
            "R/C";


        grid.appendChild(
            corner
        );


        /*
        Column labels
        */

        for (
            let column = 1;
            column <= 5;
            column++
        ) {

            grid.appendChild(
                createHeader(
                    column
                )
            );
        }


        /*
        Rows
        */

        for (
            let row = 1;
            row <= 5;
            row++
        ) {

            grid.appendChild(
                createHeader(
                    row
                )
            );


            for (
                let column = 1;
                column <= 5;
                column++
            ) {

                const index =
                    (
                        row - 1
                    )
                    *
                    5
                    +
                    (
                        column - 1
                    );


                const letter =
                    currentData
                        .square[
                            index
                        ];


                const coordinate =
                    row
                    *
                    10
                    +
                    column;


                const cell =
                    document.createElement(
                        "div"
                    );


                cell.className =
                    "polybius-cell";


                cell.dataset.letter =
                    letter;


                cell.textContent =
                    letter ===
                    "I"
                    ?
                    "I/J"
                    :
                    letter;


                const coordinateLabel =
                    document.createElement(
                        "span"
                    );


                coordinateLabel.className =
                    "polybius-coordinate";


                coordinateLabel.textContent =
                    coordinate;


                cell.appendChild(
                    coordinateLabel
                );


                grid.appendChild(
                    cell
                );

            }
        }


        container.appendChild(
            grid
        );
    }


    function createHeader(
        value
    ) {

        const header =
            document.createElement(
                "div"
            );


        header.className =
            "polybius-header";


        header.textContent =
            value;


        return header;
    }


    /*
    =====================================================
    TABLES
    =====================================================
    */

    function renderPlaintextTable() {

        const rows =
            [

                {
                    label:
                        "PLAINTEXT",

                    values:
                        [
                            ...currentData
                                .plaintext
                        ]
                },

                {
                    label:
                        "COORDINATE",

                    values:
                        currentData
                            .plaintextCoordinates
                }

            ];


        renderAlignmentTable(
            "teacher-plaintext-table",
            rows
        );
    }


    function renderKeyTable() {

        const rows =
            [

                {
                    label:
                        "KEY",

                    values:
                        [
                            ...currentData
                                .repeatedKey
                        ],

                    className:
                        "key-cell"
                },

                {
                    label:
                        "KEY NUMBER",

                    values:
                        currentData
                            .keyCoordinates,

                    className:
                        "key-cell"
                }

            ];


        renderAlignmentTable(
            "teacher-key-table",
            rows
        );
    }


    function renderFullTable() {

        const rows =
            [

                {
                    label:
                        "PLAINTEXT",

                    values:
                        [
                            ...currentData
                                .plaintext
                        ]
                },

                {
                    label:
                        "PLAIN #",

                    values:
                        currentData
                            .plaintextCoordinates
                },

                {
                    label:
                        "KEY",

                    values:
                        [
                            ...currentData
                                .repeatedKey
                        ],

                    className:
                        "key-cell"
                },

                {
                    label:
                        "KEY #",

                    values:
                        currentData
                            .keyCoordinates,

                    className:
                        "key-cell"
                },

                {
                    label:
                        "CIPHER #",

                    values:
                        currentData
                            .ciphertext,

                    className:
                        "result-cell"
                }

            ];


        renderAlignmentTable(
            "teacher-full-table",
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
            "nihilist-alignment-table";


        table.style.setProperty(
            "--nihilist-length",
            currentData
                .plaintext
                .length
        );


        rows.forEach(
            row => {

                const rowElement =
                    document.createElement(
                        "div"
                    );


                rowElement.className =
                    "nihilist-alignment-row";


                rowElement.style.setProperty(
                    "--nihilist-length",
                    currentData
                        .plaintext
                        .length
                );


                const label =
                    document.createElement(
                        "div"
                    );


                label.className =
                    "nihilist-row-label";


                label.textContent =
                    row.label;


                rowElement.appendChild(
                    label
                );


                row.values.forEach(
                    value => {

                        const cell =
                            document.createElement(
                                "div"
                            );


                        cell.className =
                            "nihilist-data-cell";


                        if (
                            row.className
                        ) {

                            cell.classList.add(
                                row.className
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

    function renderSelectedPosition() {

        const index =
            currentPosition;


        const plaintextLetter =
            currentData
                .plaintext[
                    index
                ];


        const keyLetter =
            currentData
                .repeatedKey[
                    index
                ];


        const plaintextNumber =
            currentData
                .plaintextCoordinates[
                    index
                ];


        const keyNumber =
            currentData
                .keyCoordinates[
                    index
                ];


        const cipherNumber =
            currentData
                .ciphertext[
                    index
                ];


        /*
        Highlight Polybius letter.
        */

        document
            .querySelectorAll(
                ".polybius-cell"
            )
            .forEach(
                cell => {

                    cell.classList.toggle(
                        "highlighted",

                        cell.dataset.letter
                        ===
                        plaintextLetter
                    );

                }
            );


        /*
        Coordinate explanation.
        */

        const row =
            Math.floor(
                plaintextNumber
                /
                10
            );


        const column =
            plaintextNumber
            %
            10;


        document.getElementById(
            "teacher-coordinate-demo"
        ).innerHTML =
            `
            <span>${plaintextLetter}</span>

            <span class="coordinate-arrow">
                →
            </span>

            <span>
                row ${row},
                column ${column}
            </span>

            <span class="coordinate-arrow">
                →
            </span>

            <span>${plaintextNumber}</span>
            `;


        /*
        Equation.
        */

        document.getElementById(
            "teacher-equation"
        ).innerHTML =
            `

            ${equationCard(
                "PLAINTEXT",
                `${plaintextLetter} → ${plaintextNumber}`
            )}

            <div class="nihilist-equation-symbol">
                +
            </div>

            ${equationCard(
                "KEY",
                `${keyLetter} → ${keyNumber}`
            )}

            <div class="nihilist-equation-symbol">
                =
            </div>

            ${equationCard(
                "CIPHERTEXT",
                cipherNumber
            )}

            `;


        document.getElementById(
            "teacher-position"
        ).textContent =
            `Letter ${index + 1} of ${currentData.plaintext.length}`;

    }


    function equationCard(
        label,
        value
    ) {

        return `

        <div class="nihilist-equation-card">

            <div class="nihilist-equation-label">
                ${label}
            </div>

            <div class="nihilist-equation-value">
                ${value}
            </div>

        </div>

        `;
    }


    /*
    =====================================================
    DECRYPT EXAMPLE
    =====================================================
    */

    function renderDecryptExample() {

        const cipher =
            currentData
                .ciphertext[
                    0
                ];


        const key =
            currentData
                .keyCoordinates[
                    0
                ];


        const coordinate =
            currentData
                .plaintextCoordinates[
                    0
                ];


        const letter =
            currentData
                .plaintext[
                    0
                ];


        document.getElementById(
            "teacher-decrypt-example"
        ).innerHTML =
            `

            <div class="nihilist-equation">

                ${equationCard(
                    "CIPHERTEXT",
                    cipher
                )}

                <div class="nihilist-equation-symbol">
                    −
                </div>

                ${equationCard(
                    "KEY NUMBER",
                    key
                )}

                <div class="nihilist-equation-symbol">
                    =
                </div>

                ${equationCard(
                    "COORDINATE",
                    coordinate
                )}

                <div class="nihilist-equation-symbol">
                    →
                </div>

                ${equationCard(
                    "PLAINTEXT",
                    letter
                )}

            </div>

            `;
    }


    /*
    =====================================================
    UTILITIES
    =====================================================
    */

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