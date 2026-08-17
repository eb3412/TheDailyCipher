/*
=========================================================
THE DAILY CIPHER
COMPLETE COLUMNAR TRANSPOSITION VISUAL TEACHER
=========================================================
*/


const ColumnarTeacher = (() => {


    let currentData =
        null;


    let currentReadStep =
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
            "columnar"
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
            "Build a Columnar Transposition From Scratch";


        document.getElementById(
            "teaching-description"
        ).textContent =
            "Columnar transposition does not change the letters at all. It only changes their order. The easiest way to understand it is to physically place the plaintext into a grid and watch the columns get read in key order.";


        container.innerHTML =
            createHTML();


        setupEvents();

        rebuild();

    }


    /*
    =====================================================
    PAGE HTML
    =====================================================
    */

    function createHTML() {

        return `

        <div class="columnar-teacher">


            <!-- CONTROLS -->

            <div class="columnar-stage">

                <div class="columnar-stage-number">
                    YOUR EXAMPLE
                </div>

                <h3>
                    Choose plaintext and column key
                </h3>

                <p class="columnar-stage-description">
                    The number of values in the key
                    determines how many columns the grid has.
                    A key of 3,1,4,2 therefore creates
                    four columns.
                </p>


                <div class="columnar-input-grid">

                    <div class="columnar-input-field">

                        <label for="columnar-text">
                            PLAINTEXT
                        </label>

                        <input
                            id="columnar-text"
                            type="text"
                            value="ATTACKATDAWN"
                            maxlength="40"
                            autocomplete="off"
                        >

                    </div>


                    <div class="columnar-input-field">

                        <label for="columnar-key">
                            COLUMN KEY
                        </label>

                        <input
                            id="columnar-key"
                            type="text"
                            value="3,1,4,2"
                            autocomplete="off"
                        >

                    </div>

                </div>

            </div>


            <!-- STEP 1 -->

            <div class="columnar-stage">

                <div class="columnar-stage-number">
                    STEP 1
                </div>

                <h3>
                    Understand the key
                </h3>

                <p class="columnar-stage-description">
                    The key numbers do not tell us where
                    to write the plaintext. We still write
                    left to right. The numbers tell us the
                    order in which columns will be read.
                </p>


                <div class="columnar-rule">
                    Key 3,1,4,2 means:
                    read column labeled 1 first,
                    then 2, then 3, then 4.
                </div>


                <div
                    id="columnar-order"
                    class="columnar-order"
                >
                </div>

            </div>


            <!-- STEP 2 -->

            <div class="columnar-stage">

                <div class="columnar-stage-number">
                    STEP 2
                </div>

                <h3>
                    Write plaintext across the rows
                </h3>

                <p class="columnar-stage-description">
                    Start in the upper-left corner and
                    write normally from left to right.
                    When a row fills, continue on the next
                    row.
                </p>


                <div
                    id="columnar-write-grid"
                    class="columnar-grid-wrapper"
                >
                </div>

            </div>


            <!-- STEP 3 -->

            <div class="columnar-stage">

                <div class="columnar-stage-number">
                    STEP 3
                </div>

                <h3>
                    Complete the rectangle
                </h3>

                <p class="columnar-stage-description">
                    This version uses complete columnar
                    transposition, so the rectangle must be
                    full. If the plaintext does not fill the
                    last row, X is added as padding.
                </p>


                <div
                    id="columnar-padding-info"
                >
                </div>

            </div>


            <!-- STEP 4 -->

            <div class="columnar-stage">

                <div class="columnar-stage-number">
                    STEP 4
                </div>

                <h3>
                    Read columns by key number
                </h3>

                <p class="columnar-stage-description">
                    We now stop reading left to right.
                    Find the column labeled 1 and read it
                    downward. Then find 2, then 3, and so on.
                </p>


                <div
                    id="columnar-read-grid"
                    class="columnar-grid-wrapper"
                >
                </div>


                <div
                    id="columnar-read-value"
                    class="columnar-read-box"
                >
                </div>


                <div class="columnar-position-controls">

                    <button
                        id="columnar-prev"
                        type="button"
                        class="columnar-position-button"
                    >
                        ←
                    </button>

                    <div
                        id="columnar-position"
                        class="columnar-position-count"
                    >
                    </div>

                    <button
                        id="columnar-next"
                        type="button"
                        class="columnar-position-button"
                    >
                        →
                    </button>

                </div>

            </div>


            <!-- STEP 5 -->

            <div class="columnar-stage">

                <div class="columnar-stage-number">
                    STEP 5
                </div>

                <h3>
                    Join the columns
                </h3>

                <p class="columnar-stage-description">
                    The ciphertext is simply the contents
                    of those columns placed one after
                    another in key order.
                </p>


                <div
                    id="columnar-full-result"
                >
                </div>

            </div>


            <!-- DECRYPT -->

            <div class="columnar-stage">

                <div class="columnar-stage-number">
                    DECRYPTION
                </div>

                <h3>
                    Reverse the grid
                </h3>

                <p class="columnar-stage-description">
                    If you know the key, determine the
                    number of rows, split the ciphertext
                    into equal column-sized sections, and
                    put each section back under the correct
                    key number.
                </p>


                <div class="columnar-rule">
                    ciphertext sections
                    → restore keyed columns
                    → read across rows
                    → plaintext
                </div>


                <div
                    id="columnar-decrypt-demo"
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
            "columnar-text",
            "columnar-key"
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
                "columnar-prev"
            )
            .addEventListener(
                "click",
                () => {

                    if (
                        !currentData
                    ) {

                        return;
                    }


                    currentReadStep--;


                    if (
                        currentReadStep <
                        0
                    ) {

                        currentReadStep =
                            currentData
                                .key
                                .length
                            -
                            1;
                    }


                    renderReadStep();

                }
            );


        document
            .getElementById(
                "columnar-next"
            )
            .addEventListener(
                "click",
                () => {

                    if (
                        !currentData
                    ) {

                        return;
                    }


                    currentReadStep =
                        (
                            currentReadStep
                            +
                            1
                        )
                        %
                        currentData
                            .key
                            .length;


                    renderReadStep();

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
                        "columnar-text"
                    )
                    .value
            );


        let key;


        try {

            key =
                parseKey(
                    document
                        .getElementById(
                            "columnar-key"
                        )
                        .value
                );

        } catch (
            error
        ) {

            return;
        }


        if (
            !plaintext
            ||
            !key.length
        ) {

            return;
        }


        const columns =
            key.length;


        let padded =
            plaintext;


        while (
            padded.length
            %
            columns
            !==
            0
        ) {

            padded +=
                "X";
        }


        const rows =
            [];


        for (
            let i = 0;
            i < padded.length;
            i += columns
        ) {

            rows.push(
                padded
                    .slice(
                        i,
                        i + columns
                    )
                    .split("")
            );
        }


        const readOrder =
            [];


        for (
            let label = 1;
            label <= columns;
            label++
        ) {

            const physicalColumn =
                key.indexOf(
                    label
                );


            const letters =
                rows
                    .map(
                        row =>
                            row[
                                physicalColumn
                            ]
                    )
                    .join("");


            readOrder.push({

                label,

                physicalColumn,

                letters

            });
        }


        const ciphertext =
            readOrder
                .map(
                    item =>
                        item.letters
                )
                .join("");


        currentData = {

            plaintext,

            padded,

            key,

            columns,

            rows,

            readOrder,

            ciphertext,

            paddingCount:
                padded.length
                -
                plaintext.length

        };


        if (
            currentReadStep >=
            key.length
        ) {

            currentReadStep =
                0;
        }


        renderOrder();

        renderWriteGrid();

        renderPadding();

        renderReadGrid();

        renderReadStep();

        renderFullResult();

        renderDecryptDemo();

    }


    /*
    =====================================================
    KEY PARSING
    =====================================================
    */

    function parseKey(
        input
    ) {

        const key =
            String(
                input
            )
            .split(",")
            .map(
                value =>
                    Number(
                        value.trim()
                    )
            );


        if (
            key.length <
            2
        ) {

            throw new Error(
                "Use at least two columns."
            );
        }


        if (
            key.some(
                value =>
                    !Number.isInteger(
                        value
                    )
            )
        ) {

            throw new Error(
                "Key values must be whole numbers."
            );
        }


        const sorted =
            [
                ...key
            ]
            .sort(
                (
                    a,
                    b
                ) =>
                    a - b
            );


        const expected =
            Array.from(
                {
                    length:
                        key.length
                },
                (
                    _,
                    index
                ) =>
                    index + 1
            );


        if (
            JSON.stringify(
                sorted
            )
            !==
            JSON.stringify(
                expected
            )
        ) {

            throw new Error(
                `Use each number 1 through ${key.length} exactly once.`
            );
        }


        return key;
    }


    /*
    =====================================================
    KEY ORDER
    =====================================================
    */

    function renderOrder() {

        const container =
            document.getElementById(
                "columnar-order"
            );


        container.innerHTML =
            "";


        currentData
            .readOrder
            .forEach(
                (
                    item,
                    index
                ) => {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "columnar-order-card";


                    if (
                        index ===
                        currentReadStep
                    ) {

                        card.classList.add(
                            "active"
                        );
                    }


                    card.innerHTML =
                        `

                        <div class="columnar-order-label">
                            READ ${item.label}
                        </div>

                        <div class="columnar-order-value">
                            physical column
                            ${item.physicalColumn + 1}
                        </div>

                        `;


                    container.appendChild(
                        card
                    );

                }
            );
    }


    /*
    =====================================================
    WRITE GRID
    =====================================================
    */

    function renderWriteGrid() {

        renderGrid(
            "columnar-write-grid",
            null
        );
    }


    /*
    =====================================================
    READ GRID
    =====================================================
    */

    function renderReadGrid() {

        const activePhysicalColumn =
            currentData
                .readOrder[
                    currentReadStep
                ]
                .physicalColumn;


        renderGrid(
            "columnar-read-grid",
            activePhysicalColumn
        );
    }


    /*
    =====================================================
    GENERIC GRID
    =====================================================
    */

    function renderGrid(
        containerId,
        highlightedColumn
    ) {

        const wrapper =
            document.getElementById(
                containerId
            );


        wrapper.innerHTML =
            "";


        const grid =
            document.createElement(
                "div"
            );


        grid.className =
            "columnar-grid";


        grid.style
            .gridTemplateColumns =
                `repeat(${currentData.columns}, 52px)`;


        /*
        Key row.
        */

        currentData.key
            .forEach(
                (
                    value,
                    column
                ) => {

                    const cell =
                        document.createElement(
                            "div"
                        );


                    cell.className =
                        "columnar-key-cell";


                    if (
                        column ===
                        highlightedColumn
                    ) {

                        cell.classList.add(
                            "active"
                        );
                    }


                    cell.textContent =
                        value;


                    grid.appendChild(
                        cell
                    );

                }
            );


        /*
        Message rows.
        */

        currentData.rows
            .forEach(
                (
                    row,
                    rowIndex
                ) => {

                    row.forEach(
                        (
                            letter,
                            column
                        ) => {

                            const cell =
                                document.createElement(
                                    "div"
                                );


                            cell.className =
                                "columnar-grid-cell";


                            if (
                                column ===
                                highlightedColumn
                            ) {

                                cell.classList.add(
                                    "active"
                                );
                            }


                            const absoluteIndex =
                                rowIndex
                                *
                                currentData.columns
                                +
                                column;


                            if (
                                absoluteIndex
                                >=
                                currentData
                                    .plaintext
                                    .length
                            ) {

                                cell.classList.add(
                                    "padding-cell"
                                );
                            }


                            cell.textContent =
                                letter;


                            grid.appendChild(
                                cell
                            );

                        }
                    );

                }
            );


        wrapper.appendChild(
            grid
        );
    }


    /*
    =====================================================
    PADDING
    =====================================================
    */

    function renderPadding() {

        const container =
            document.getElementById(
                "columnar-padding-info"
            );


        if (
            currentData
                .paddingCount
            ===
            0
        ) {

            container.innerHTML =
                `

                <div class="columnar-rule">
                    This plaintext already fills the
                    rectangle exactly. No padding is needed.
                </div>

                `;


            return;
        }


        container.innerHTML =
            `

            <div class="columnar-pipeline">

                ${pipelineCard(
                    "ORIGINAL",
                    currentData.plaintext
                )}

                <div class="columnar-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "ADD PADDING",
                    `${currentData.paddingCount} X`
                )}

                <div class="columnar-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "COMPLETE TEXT",
                    currentData.padded
                )}

            </div>

            `;
    }


    /*
    =====================================================
    READ STEP
    =====================================================
    */

    function renderReadStep() {

        const item =
            currentData
                .readOrder[
                    currentReadStep
                ];


        renderReadGrid();

        renderOrder();


        document.getElementById(
            "columnar-read-value"
        ).innerHTML =
            `

            <div class="columnar-read-title">
                READ KEY ${item.label}
                — PHYSICAL COLUMN
                ${item.physicalColumn + 1}
            </div>

            <div class="columnar-read-value">
                ${item.letters}
            </div>

            `;


        document.getElementById(
            "columnar-position"
        ).textContent =
            `Column ${currentReadStep + 1} of ${currentData.columns}`;

    }


    /*
    =====================================================
    FULL RESULT
    =====================================================
    */

    function renderFullResult() {

        const sequence =
            currentData
                .readOrder
                .map(
                    item =>
                        pipelineCard(
                            `KEY ${item.label}`,
                            item.letters
                        )
                )
                .join(
                    `<div class="columnar-pipeline-arrow">+</div>`
                );


        document.getElementById(
            "columnar-full-result"
        ).innerHTML =
            `

            <div class="columnar-pipeline">

                ${sequence}

            </div>


            <div class="columnar-rule">
                FINAL CIPHERTEXT:
                ${currentData.ciphertext}
            </div>

            `;
    }


    /*
    =====================================================
    DECRYPTION DEMO
    =====================================================
    */

    function renderDecryptDemo() {

        const sections =
            currentData
                .readOrder
                .map(
                    item =>
                        `Key ${item.label}: ${item.letters}`
                )
                .join(
                    " | "
                );


        document.getElementById(
            "columnar-decrypt-demo"
        ).innerHTML =
            `

            <div class="columnar-pipeline">

                ${pipelineCard(
                    "CIPHERTEXT",
                    currentData.ciphertext
                )}

                <div class="columnar-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "SPLIT INTO COLUMNS",
                    sections
                )}

                <div class="columnar-pipeline-arrow">
                    →
                </div>

                ${pipelineCard(
                    "READ ROWS",
                    currentData.padded
                )}

            </div>

            `;
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

        <div class="columnar-pipeline-card">

            <div class="columnar-pipeline-label">
                ${label}
            </div>

            <div class="columnar-pipeline-value">
                ${value}
            </div>

        </div>

        `;
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