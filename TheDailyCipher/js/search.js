/*
=========================================================
THE DAILY CIPHER
Learn Hub Search + Filtering v3.0
=========================================================
*/


let encyclopediaCiphers =
    [];


let filteredCiphers =
    [];


/*
=========================================================
LOAD
=========================================================
*/

async function loadCipherEncyclopedia() {

    const grid =
        document.getElementById(
            "cipher-grid"
        );


    if (!grid) {

        return;
    }


    try {

        const response =
            await fetch(
                "../data/encyclopedia.json"
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `Could not load encyclopedia: HTTP ${response.status}`
            );
        }


        encyclopediaCiphers =
            await response.json();


        /*
        Every engine-supported cipher now
        has a dynamic full guide.
        */

        encyclopediaCiphers.forEach(
            cipher => {

                cipher.guideReady =
                    true;

            }
        );


        populateCategoryFilter();

        updateLearnSummary();

        setupLearnEvents();

        applyLearnFilters();


    } catch (error) {

        console.error(
            "Learn Hub loading error:",
            error
        );


        grid.innerHTML =
            `
            <div class="learn-empty">
                Could not load the cryptography encyclopedia.
            </div>
            `;
    }
}


/*
=========================================================
CATEGORY
=========================================================
*/

function populateCategoryFilter() {

    const select =
        document.getElementById(
            "category-filter"
        );


    const categories =
        [
            ...new Set(
                encyclopediaCiphers
                    .map(
                        cipher =>
                            cipher.category
                    )
            )
        ]
        .sort();


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;


            option.textContent =
                category;


            select.appendChild(
                option
            );

        }
    );
}


/*
=========================================================
SUMMARY
=========================================================
*/

function updateLearnSummary() {

    setLearnText(
        "learn-total-ciphers",
        encyclopediaCiphers.length
    );


    setLearnText(
        "learn-categories",
        new Set(
            encyclopediaCiphers.map(
                cipher =>
                    cipher.category
            )
        ).size
    );


    /*
    All current ciphers now have guides.
    */

    setLearnText(
        "learn-pages-ready",
        encyclopediaCiphers.length
    );
}


/*
=========================================================
EVENTS
=========================================================
*/

function setupLearnEvents() {

    [
        "cipher-search",
        "category-filter",
        "difficulty-filter",
        "sort-filter"
    ]
    .forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            element.addEventListener(
                id ===
                "cipher-search"
                    ?
                    "input"
                    :
                    "change",

                applyLearnFilters
            );

        }
    );


    document.getElementById(
        "clear-learn-filters"
    )
    .addEventListener(
        "click",
        clearLearnFilters
    );
}


/*
=========================================================
FILTER
=========================================================
*/

function applyLearnFilters() {

    const query =
        document.getElementById(
            "cipher-search"
        )
        .value
        .trim()
        .toLowerCase();


    const category =
        document.getElementById(
            "category-filter"
        ).value;


    const difficulty =
        document.getElementById(
            "difficulty-filter"
        ).value;


    const sort =
        document.getElementById(
            "sort-filter"
        ).value;


    filteredCiphers =
        encyclopediaCiphers.filter(
            cipher => {

                const searchable =
                    [

                        cipher.name,

                        cipher.category,

                        cipher.difficulty,

                        cipher.description,

                        ...(
                            cipher.keywords
                            ||
                            []
                        )

                    ]
                    .join(" ")
                    .toLowerCase();


                return (

                    (
                        !query
                        ||
                        searchable.includes(
                            query
                        )
                    )

                    &&

                    (
                        category ===
                        "all"
                        ||
                        cipher.category
                        ===
                        category
                    )

                    &&

                    (
                        difficulty ===
                        "all"
                        ||
                        cipher.difficulty
                        ===
                        difficulty
                    )

                );

            }
        );


    sortLearnCiphers(
        filteredCiphers,
        sort
    );


    renderLearnCiphers(
        filteredCiphers
    );


    updateResultCount();
}


/*
=========================================================
SORT
=========================================================
*/

function sortLearnCiphers(
    ciphers,
    sort
) {

    const difficultyOrder = {

        Beginner:
            1,

        Intermediate:
            2,

        Advanced:
            3

    };


    if (
        sort ===
        "difficulty"
    ) {

        ciphers.sort(
            (
                a,
                b
            ) =>
                (
                    difficultyOrder[
                        a.difficulty
                    ]
                    -
                    difficultyOrder[
                        b.difficulty
                    ]
                )
                ||
                a.name.localeCompare(
                    b.name
                )
        );


        return;
    }


    if (
        sort ===
        "category"
    ) {

        ciphers.sort(
            (
                a,
                b
            ) =>
                a.category.localeCompare(
                    b.category
                )
                ||
                a.name.localeCompare(
                    b.name
                )
        );


        return;
    }


    ciphers.sort(
        (
            a,
            b
        ) =>
            a.name.localeCompare(
                b.name
            )
    );
}


/*
=========================================================
RENDER
=========================================================
*/

function renderLearnCiphers(
    ciphers
) {

    const grid =
        document.getElementById(
            "cipher-grid"
        );


    grid.innerHTML =
        "";


    if (
        !ciphers.length
    ) {

        grid.innerHTML =
            `
            <div class="learn-empty">
                No ciphers match those filters.
            </div>
            `;


        return;
    }


    ciphers.forEach(
        cipher => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "cipher-learning-card";


            /*
            TOP
            */

            const top =
                document.createElement(
                    "div"
                );


            top.className =
                "cipher-card-top";


            const category =
                document.createElement(
                    "div"
                );


            category.className =
                "cipher-card-category";


            category.textContent =
                cipher.category
                    .toUpperCase();


            const difficulty =
                document.createElement(
                    "div"
                );


            difficulty.className =
                "cipher-difficulty-badge";


            difficulty.textContent =
                cipher.difficulty;


            top.appendChild(
                category
            );


            top.appendChild(
                difficulty
            );


            /*
            TEXT
            */

            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                cipher.name;


            const description =
                document.createElement(
                    "p"
                );


            description.className =
                "cipher-description";


            description.textContent =
                cipher.description;


            /*
            TAGS
            */

            const tags =
                document.createElement(
                    "div"
                );


            tags.className =
                "cipher-tags";


            if (
                cipher.scienceOlympiad
            ) {

                tags.appendChild(
                    createCipherTag(
                        "SCIENCE OLYMPIAD",
                        true
                    )
                );
            }


            (
                cipher.keywords
                ||
                []
            )
            .slice(
                0,
                3
            )
            .forEach(
                keyword => {

                    tags.appendChild(
                        createCipherTag(
                            keyword
                        )
                    );

                }
            );


            /*
            ACTIONS
            */

            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "cipher-card-actions";


            const learn =
                document.createElement(
                    "a"
                );


            learn.className =
                "learn-card-button primary";


            if (
                cipher.page
                &&
                cipher.page !== "cipher.html"
            ) {

                learn.href =
                    cipher.page;

            } else {

                learn.href =
                    `cipher.html?id=${encodeURIComponent(
                        cipher.id
                    )}`;
            }


            learn.textContent =
                "Learn";


            const practice =
                document.createElement(
                    "a"
                );


            practice.className =
                "learn-card-button";


            const practiceId =
                cipher.practiceId === undefined
                    ? cipher.id
                    : cipher.practiceId;


            if (practiceId) {

                practice.href =
                    `../practice/index.html?cipher=${encodeURIComponent(
                        practiceId
                    )}`;


                practice.textContent =
                    "Practice";

            } else {

                practice.href =
                    "../practice/index.html";


                practice.textContent =
                    "Practice Hub";
            }


            actions.appendChild(
                learn
            );


            if (
                cipher.visualizer
            ) {

                const visualizer =
                    document.createElement(
                        "a"
                    );


                visualizer.className =
                    "learn-card-button";


                visualizer.href =
                    cipher.visualizer;


                visualizer.textContent =
                    "Visualize";


                actions.appendChild(
                    visualizer
                );
            }


            actions.appendChild(
                practice
            );


            card.appendChild(
                top
            );


            card.appendChild(
                title
            );


            card.appendChild(
                description
            );


            card.appendChild(
                tags
            );


            card.appendChild(
                actions
            );


            grid.appendChild(
                card
            );

        }
    );
}


/*
=========================================================
TAG
=========================================================
*/

function createCipherTag(
    text,
    scioly =
        false
) {

    const tag =
        document.createElement(
            "span"
        );


    tag.className =
        "cipher-tag"
        +
        (
            scioly
                ?
                " scioly"
                :
                ""
        );


    tag.textContent =
        text;


    return tag;
}


/*
=========================================================
COUNT
=========================================================
*/

function updateResultCount() {

    const count =
        filteredCiphers.length;


    setLearnText(

        "learn-result-count",

        `Showing ${count} cipher`
        +
        (
            count === 1
                ?
                ""
                :
                "s"
        )

    );
}


/*
=========================================================
CLEAR
=========================================================
*/

function clearLearnFilters() {

    document.getElementById(
        "cipher-search"
    ).value =
        "";


    document.getElementById(
        "category-filter"
    ).value =
        "all";


    document.getElementById(
        "difficulty-filter"
    ).value =
        "all";


    document.getElementById(
        "sort-filter"
    ).value =
        "name";


    applyLearnFilters();
}


/*
=========================================================
HELPER
=========================================================
*/

function setLearnText(
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


/*
=========================================================
START
=========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    loadCipherEncyclopedia
);