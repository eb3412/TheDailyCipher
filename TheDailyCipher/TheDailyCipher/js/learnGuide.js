/*
=========================================================
THE DAILY CIPHER
Dynamic Learn Guide
=========================================================
*/


let activeGuide =
    null;


/*
=========================================================
START
=========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    loadGuide
);


/*
=========================================================
LOAD GUIDE
=========================================================
*/

async function loadGuide() {

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const id =
            params.get(
                "id"
            );


        if (!id) {

            throw new Error(
                "No cipher selected."
            );
        }


        const response =
            await fetch(
                "../data/guides.json"
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Could not load guides."
            );
        }


        const guides =
            await response.json();


        activeGuide =
            guides.find(
                guide =>
                    guide.id ===
                    id
            );


        if (
            !activeGuide
        ) {

            throw new Error(
                `Guide not found: ${id}`
            );
        }


        renderGuide();

setupVisualizer();


/*
Advanced visual teaching modules.
*/

if (
    typeof NihilistTeacher
    !==
    "undefined"
) {

    NihilistTeacher.initialize(
        activeGuide
    );
}


if (
    typeof HillTeacher
    !==
    "undefined"
) {

    HillTeacher.initialize(
        activeGuide
    );
}


if (
    typeof FractionatedMorseTeacher
    !==
    "undefined"
) {

    FractionatedMorseTeacher.initialize(
        activeGuide
    );
}


if (
    typeof ColumnarTeacher
    !==
    "undefined"
) {

    ColumnarTeacher.initialize(
        activeGuide
    );
}


if (
    typeof PortaTeacher
    !==
    "undefined"
) {

    PortaTeacher.initialize(
        activeGuide
    );
}


if (
    typeof SubstitutionTrainer
    !==
    "undefined"
) {

    SubstitutionTrainer.initialize(
        activeGuide
    );
}


if (
    typeof BasicCipherTeacher
    !==
    "undefined"
) {

    BasicCipherTeacher.initialize(
        activeGuide
    );
}
    } catch (error) {

        console.error(
            error
        );


        document.getElementById(
            "guide-title"
        ).textContent =
            "Guide Not Found";


        document.getElementById(
            "guide-summary"
        ).textContent =
            error.message;
    }
}


/*
=========================================================
RENDER
=========================================================
*/

function renderGuide() {

    document.title =
        `${activeGuide.name} Guide | The Daily Cipher`;


    document.getElementById(
        "page-description"
    ).content =
        activeGuide.summary;


    setText(
        "guide-category",
        activeGuide.category
            .toUpperCase()
    );


    setText(
        "guide-title",
        activeGuide.name
    );


    setText(
        "guide-summary",
        activeGuide.summary
    );


    renderMeta();

    renderParagraphs(
        "guide-history",
        activeGuide.history
    );


    renderParagraphs(
        "guide-mechanics",
        activeGuide.mechanics
    );


    renderSteps(
        "encrypt-steps",
        activeGuide.encryptSteps
    );


    renderExample();


    renderParagraphs(
        "solve-intro",
        activeGuide.solveIntro
    );


    renderSteps(
        "solve-steps",
        activeGuide.solveSteps
    );


    renderMistakes();


    document.getElementById(
        "guide-practice"
    ).href =
        `../practice/index.html?cipher=${encodeURIComponent(
            activeGuide.id
        )}`;
}


/*
=========================================================
META
=========================================================
*/

function renderMeta() {

    const container =
        document.getElementById(
            "guide-meta"
        );


    container.innerHTML =
        "";


    [
        activeGuide.category,
        activeGuide.difficulty
    ]
    .forEach(
        text => {

            container.appendChild(
                createBadge(
                    text
                )
            );

        }
    );


    if (
        activeGuide.scioly
    ) {

        container.appendChild(
            createBadge(
                "SCIENCE OLYMPIAD RELEVANCE"
            )
        );
    }
}


function createBadge(
    text
) {

    const badge =
        document.createElement(
            "span"
        );


    badge.className =
        "guide-badge";


    badge.textContent =
        text;


    return badge;
}


/*
=========================================================
PARAGRAPHS
=========================================================
*/

function renderParagraphs(
    id,
    paragraphs
) {

    const container =
        document.getElementById(
            id
        );


    container.innerHTML =
        "";


    (
        paragraphs
        ||
        []
    )
    .forEach(
        paragraph => {

            const p =
                document.createElement(
                    "p"
                );


            p.textContent =
                paragraph;


            container.appendChild(
                p
            );

        }
    );
}


/*
=========================================================
STEPS
=========================================================
*/

function renderSteps(
    id,
    steps
) {

    const container =
        document.getElementById(
            id
        );


    container.innerHTML =
        "";


    (
        steps
        ||
        []
    )
    .forEach(
        (
            step,
            index
        ) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "guide-step";


            const number =
                document.createElement(
                    "div"
                );


            number.className =
                "guide-step-number";


            number.textContent =
                index + 1;


            const content =
                document.createElement(
                    "div"
                );


            const title =
                document.createElement(
                    "strong"
                );


            title.textContent =
                `Step ${index + 1}`;


            const text =
                document.createElement(
                    "p"
                );


            text.textContent =
                step;


            content.appendChild(
                title
            );


            content.appendChild(
                text
            );


            card.appendChild(
                number
            );


            card.appendChild(
                content
            );


            container.appendChild(
                card
            );

        }
    );
}


/*
=========================================================
EXAMPLE
=========================================================
*/

function renderExample() {

    const example =
        activeGuide.example;


    const container =
        document.getElementById(
            "guide-example"
        );


    container.innerHTML =
        "";


    createExampleRow(
        container,
        "PLAINTEXT",
        example.plaintext
    );


    createExampleRow(
        container,
        "KEY",
        example.key
    );


    createExampleRow(
        container,
        "CIPHERTEXT",
        example.ciphertext
    );
}


function createExampleRow(
    container,
    label,
    value
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "example-row";


    const labelElement =
        document.createElement(
            "span"
        );


    labelElement.textContent =
        label;


    const valueElement =
        document.createElement(
            "strong"
        );


    valueElement.textContent =
        value;


    row.appendChild(
        labelElement
    );


    row.appendChild(
        valueElement
    );


    container.appendChild(
        row
    );
}


/*
=========================================================
MISTAKES
=========================================================
*/

function renderMistakes() {

    const container =
        document.getElementById(
            "guide-mistakes"
        );


    container.innerHTML =
        "";


    activeGuide.mistakes
        .forEach(
            mistake => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "mistake-card";


                card.textContent =
                    `⚠ ${mistake}`;


                container.appendChild(
                    card
                );

            }
        );
}


/*
=========================================================
VISUALIZER
=========================================================
*/

function setupVisualizer() {

    renderVisualizerControls();


    document.getElementById(
        "run-visualizer"
    )
    .addEventListener(
        "click",
        runVisualizer
    );


    runVisualizer();
}


/*
=========================================================
CONTROL DEFINITIONS
=========================================================
*/

function getVisualizerDefinition() {

    switch (
        activeGuide.id
    ) {

        case "caesar":

            return [
                {
                    id:
                        "viz-text",

                    label:
                        "Plaintext",

                    value:
                        "HELLO WORLD"
                },

                {
                    id:
                        "viz-shift",

                    label:
                        "Shift",

                    value:
                        "3",

                    type:
                        "number"
                }
            ];


        case "atbash":

            return [
                {
                    id:
                        "viz-text",

                    label:
                        "Plaintext",

                    value:
                        "HELLO WORLD"
                }
            ];


        case "affine":

            return [
                {
                    id:
                        "viz-text",

                    label:
                        "Plaintext",

                    value:
                        "AFFINE CIPHER"
                },

                {
                    id:
                        "viz-a",

                    label:
                        "A",

                    value:
                        "5",

                    type:
                        "number"
                },

                {
                    id:
                        "viz-b",

                    label:
                        "B",

                    value:
                        "8",

                    type:
                        "number"
                }
            ];


        case "railfence":

            return [
                {
                    id:
                        "viz-text",

                    label:
                        "Plaintext",

                    value:
                        "WEAREDISCOVEREDFLEEATONCE"
                },

                {
                    id:
                        "viz-rails",

                    label:
                        "Rails",

                    value:
                        "3",

                    type:
                        "number"
                }
            ];


        case "baconian":

            return [
                {
                    id:
                        "viz-text",

                    label:
                        "Plaintext",

                    value:
                        "ABC"
                }
            ];


        case "aristocrat":
        case "patristocrat":

            return [
                {
                    id:
                        "viz-text",

                    label:
                        "Plaintext",

                    value:
                        "HELLO WORLD"
                },

                {
                    id:
                        "viz-alphabet",

                    label:
                        "Cipher Alphabet",

                    value:
                        "BCDEFGHIJKLMNOPQRSTUVWXYZA"
                }
            ];


        case "porta":

            return [
                {
                    id:
                        "viz-text",

                    label:
                        "Plaintext",

                    value:
                        "HELLO WORLD"
                },

                {
                    id:
                        "viz-keyword",

                    label:
                        "Keyword",

                    value:
                        "SECRET"
                }
            ];


        case "columnar":

            return [
                {
                    id:
                        "viz-text",

                    label:
                        "Plaintext",

                    value:
                        "ATTACKATDAWN"
                },

                {
                    id:
                        "viz-columnar",

                    label:
                        "Column Key",

                    value:
                        "3,1,4,2"
                }
            ];


        case "nihilist":

            return [
                {
                    id:
                        "viz-text",

                    label:
                        "Plaintext",

                    value:
                        "HELLO"
                },

                {
                    id:
                        "viz-square-key",

                    label:
                        "Square Keyword",

                    value:
                        "CIPHER"
                },

                {
                    id:
                        "viz-add-key",

                    label:
                        "Additive Keyword",

                    value:
                        "SECRET"
                }
            ];


        case "hill":

            return [
                {
                    id:
                        "viz-text",

                    label:
                        "Plaintext",

                    value:
                        "HELP"
                },

                {
                    id:
                        "viz-matrix",

                    label:
                        "Matrix — rows separated by ;",

                    value:
                        "3,3;2,5"
                }
            ];


        case "fractionatedmorse":

            return [
                {
                    id:
                        "viz-text",

                    label:
                        "Plaintext",

                    value:
                        "HELLO WORLD"
                },

                {
                    id:
                        "viz-keyword",

                    label:
                        "Keyword",

                    value:
                        "CIPHER"
                }
            ];


        default:

            return [];
    }
}


/*
=========================================================
RENDER CONTROLS
=========================================================
*/

function renderVisualizerControls() {

    const container =
        document.getElementById(
            "visualizer-controls"
        );


    container.innerHTML =
        "";


    const controls =
        document.createElement(
            "div"
        );


    controls.className =
        "visualizer-controls";


    getVisualizerDefinition()
        .forEach(
            field => {

                const wrapper =
                    document.createElement(
                        "div"
                    );


                wrapper.className =
                    "visualizer-field";


                const label =
                    document.createElement(
                        "label"
                    );


                label.htmlFor =
                    field.id;


                label.textContent =
                    field.label;


                const input =
                    document.createElement(
                        "input"
                    );


                input.id =
                    field.id;


                input.type =
                    field.type
                    ||
                    "text";


                input.value =
                    field.value;


                wrapper.appendChild(
    label
);


/*
Pretty controls for numbers.
*/

if (
    field.type ===
    "number"
) {

    const stepper =
        document.createElement(
            "div"
        );


    stepper.className =
        "number-stepper";


    const minus =
        document.createElement(
            "button"
        );


    minus.type =
        "button";


    minus.className =
        "number-stepper-button";


    minus.textContent =
        "−";


    const plus =
        document.createElement(
            "button"
        );


    plus.type =
        "button";


    plus.className =
        "number-stepper-button";


    plus.textContent =
        "+";


    minus.addEventListener(
        "click",
        () => {

            const current =
                Number(
                    input.value
                )
                ||
                0;


            input.value =
                current - 1;


            runVisualizer();
        }
    );


    plus.addEventListener(
        "click",
        () => {

            const current =
                Number(
                    input.value
                )
                ||
                0;


            input.value =
                current + 1;


            runVisualizer();
        }
    );


    stepper.appendChild(
        minus
    );


    stepper.appendChild(
        input
    );


    stepper.appendChild(
        plus
    );


    wrapper.appendChild(
        stepper
    );


} else {

    wrapper.appendChild(
        input
    );
}


controls.appendChild(
    wrapper
);

            }
        );


    container.appendChild(
        controls
    );
}


/*
=========================================================
RUN
=========================================================
*/

function runVisualizer() {

    const output =
        document.getElementById(
            "visualizer-output"
        );


    output.classList.remove(
        "visualizer-error"
    );


    const railWrapper =
        document.getElementById(
            "rail-grid-wrapper"
        );


    railWrapper.classList.add(
        "hidden"
    );


    try {

        const id =
            activeGuide.id;


        const text =
            document.getElementById(
                "viz-text"
            ).value;


        let parameters =
            {};


        switch (id) {

            case "caesar":

                parameters.shift =
                    Number(
                        document.getElementById(
                            "viz-shift"
                        ).value
                    );

                break;


            case "affine":

                parameters.a =
                    Number(
                        document.getElementById(
                            "viz-a"
                        ).value
                    );


                parameters.b =
                    Number(
                        document.getElementById(
                            "viz-b"
                        ).value
                    );

                break;


            case "railfence":

                renderRailGrid(
                    text,
                    Number(
                        document.getElementById(
                            "viz-rails"
                        ).value
                    )
                );

                return;


            case "aristocrat":
            case "patristocrat":

                parameters.alphabet =
                    document.getElementById(
                        "viz-alphabet"
                    ).value
                    .toUpperCase();

                break;


            case "porta":
            case "fractionatedmorse":

                parameters.keyword =
                    document.getElementById(
                        "viz-keyword"
                    ).value
                    .toUpperCase();

                break;


            case "columnar":

                parameters.key =
                    document.getElementById(
                        "viz-columnar"
                    ).value
                    .split(",")
                    .map(
                        value =>
                            Number(
                                value.trim()
                            )
                    );

                break;


            case "nihilist":

                parameters.squareKeyword =
                    document.getElementById(
                        "viz-square-key"
                    ).value
                    .toUpperCase();


                parameters.additiveKeyword =
                    document.getElementById(
                        "viz-add-key"
                    ).value
                    .toUpperCase();

                break;


            case "hill":

                parameters.matrix =
                    parseMatrix(
                        document.getElementById(
                            "viz-matrix"
                        ).value
                    );

                break;
        }


        output.textContent =
            CipherEngine.encrypt(
                id,
                text,
                parameters
            );


    } catch (error) {

        output.classList.add(
            "visualizer-error"
        );


        output.textContent =
            error.message;
    }
}


/*
=========================================================
HILL MATRIX PARSER
=========================================================
*/

function parseMatrix(
    text
) {

    return text
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
}


/*
=========================================================
RAIL FENCE GRID
=========================================================
*/

function renderRailGrid(
    plaintext,
    rails
) {

    if (
        !Number.isInteger(
            rails
        )
        ||
        rails < 2
    ) {

        throw new Error(
            "Rail count must be at least 2."
        );
    }


    const text =
        plaintext
            .toUpperCase()
            .replace(
                /[^A-Z]/g,
                ""
            );


    if (!text) {

        throw new Error(
            "Enter some letters."
        );
    }


    const grid =
        Array.from(
            {
                length:
                    rails
            },
            () =>
                Array(
                    text.length
                )
                .fill("")
        );


    let rail =
        0;


    let direction =
        1;


    for (
        let column = 0;
        column < text.length;
        column++
    ) {

        grid[
            rail
        ][
            column
        ] =
            text[
                column
            ];


        if (
            rail ===
            0
        ) {

            direction =
                1;

        } else if (
            rail ===
            rails - 1
        ) {

            direction =
                -1;
        }


        rail +=
            direction;
    }


    const gridElement =
        document.getElementById(
            "rail-grid"
        );


    gridElement.innerHTML =
        "";


    gridElement.className =
        "rail-guide-grid";


    gridElement.style
        .gridTemplateColumns =
            `repeat(${text.length}, 31px)`;


    gridElement.style
        .gridTemplateRows =
            `repeat(${rails}, 31px)`;


    for (
        let row = 0;
        row < rails;
        row++
    ) {

        for (
            let column = 0;
            column < text.length;
            column++
        ) {

            const cell =
                document.createElement(
                    "div"
                );


            cell.className =
                "rail-guide-cell";


            const value =
                grid[
                    row
                ][
                    column
                ];


            if (
                value
            ) {

                cell.classList.add(
                    "filled"
                );


                cell.textContent =
                    value;
            }


            /*
            Critical:
            explicitly define grid position.
            */

            cell.style.gridRow =
                row + 1;


            cell.style.gridColumn =
                column + 1;


            gridElement.appendChild(
                cell
            );
        }
    }


    const ciphertext =
        grid
            .flat()
            .join("");


    document.getElementById(
        "rail-result"
    ).textContent =
        `READ RAILS → ${ciphertext}`;


    document.getElementById(
        "rail-grid-wrapper"
    )
    .classList.remove(
        "hidden"
    );


    document.getElementById(
        "visualizer-output"
    ).textContent =
        ciphertext;
}


/*
=========================================================
HELPER
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


    if (
        element
    ) {

        element.textContent =
            value;
    }
}