function normalizeAnswer(value) {
    return value
        .trim()
        .toUpperCase()
        .replace(/\s+/g, " ");
}

function getTodayString() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function randomItem(array) {
    return array[
        Math.floor(Math.random() * array.length)
    ];
}

function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] =
            [result[j], result[i]];
    }

    return result;
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
/*
=========================================================
THE DAILY CIPHER
CUSTOM SELECT UI
=========================================================
*/


function enhanceSelect(
    select
) {

    /*
    Don't enhance twice.
    */

    if (
        select.dataset.customSelect
        ===
        "true"
    ) {

        return;
    }


    select.dataset.customSelect =
        "true";


    /*
    Wrapper
    */

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "custom-select";


    select.parentNode
        .insertBefore(
            wrapper,
            select
        );


    wrapper.appendChild(
        select
    );


    /*
    Visible button
    */

    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "custom-select-button";


    button.setAttribute(
        "aria-haspopup",
        "listbox"
    );


    button.setAttribute(
        "aria-expanded",
        "false"
    );


    const value =
        document.createElement(
            "span"
        );


    value.className =
        "custom-select-value";


    const arrow =
        document.createElement(
            "span"
        );


    arrow.className =
        "custom-select-arrow";


    button.appendChild(
        value
    );


    button.appendChild(
        arrow
    );


    /*
    Menu
    */

    const menu =
        document.createElement(
            "div"
        );


    menu.className =
        "custom-select-menu";


    menu.setAttribute(
        "role",
        "listbox"
    );


    wrapper.appendChild(
        button
    );


    wrapper.appendChild(
        menu
    );


    /*
    Rebuild options whenever the real
    select changes dynamically.
    */

    function rebuild() {

        menu.innerHTML =
            "";


        [
            ...select.options
        ]
        .forEach(
            option => {

                const item =
                    document.createElement(
                        "button"
                    );


                item.type =
                    "button";


                item.className =
                    "custom-select-option";


                item.dataset.value =
                    option.value;


                item.textContent =
                    option.textContent;


                item.setAttribute(
                    "role",
                    "option"
                );


                if (
                    option.selected
                ) {

                    item.classList.add(
                        "selected"
                    );


                    item.setAttribute(
                        "aria-selected",
                        "true"
                    );

                } else {

                    item.setAttribute(
                        "aria-selected",
                        "false"
                    );
                }


                item.addEventListener(
                    "click",
                    () => {

                        select.value =
                            option.value;


                        /*
                        Trigger existing site logic.
                        */

                        select.dispatchEvent(
                            new Event(
                                "change",
                                {
                                    bubbles:
                                        true
                                }
                            )
                        );


                        sync();

                        closeMenu();

                    }
                );


                menu.appendChild(
                    item
                );

            }
        );


        sync();
    }


    /*
    Sync visible label.
    */

    function sync() {

        const selected =
            select.options[
                select.selectedIndex
            ];


        value.textContent =
            selected
                ?
                selected.textContent
                :
                "Select";


        menu
            .querySelectorAll(
                ".custom-select-option"
            )
            .forEach(
                item => {

                    const isSelected =
                        item.dataset.value
                        ===
                        select.value;


                    item.classList.toggle(
                        "selected",
                        isSelected
                    );


                    item.setAttribute(
                        "aria-selected",
                        String(
                            isSelected
                        )
                    );

                }
            );
    }


    function openMenu() {

        /*
        Close other dropdowns first.
        */

        document
            .querySelectorAll(
                ".custom-select.open"
            )
            .forEach(
                other => {

                    if (
                        other !==
                        wrapper
                    ) {

                        other.classList.remove(
                            "open"
                        );


                        const otherButton =
                            other.querySelector(
                                ".custom-select-button"
                            );


                        if (
                            otherButton
                        ) {

                            otherButton.setAttribute(
                                "aria-expanded",
                                "false"
                            );
                        }
                    }

                }
            );


        wrapper.classList.add(
            "open"
        );


        button.setAttribute(
            "aria-expanded",
            "true"
        );
    }


    function closeMenu() {

        wrapper.classList.remove(
            "open"
        );


        button.setAttribute(
            "aria-expanded",
            "false"
        );
    }


    button.addEventListener(
        "click",
        () => {

            if (
                wrapper.classList.contains(
                    "open"
                )
            ) {

                closeMenu();

            } else {

                openMenu();
            }

        }
    );


    /*
    Keep custom UI synchronized if JS
    changes the original select.
    */

    select.addEventListener(
        "change",
        sync
    );


    /*
    Watch dynamically generated options,
    such as your cipher dropdown.
    */

    const observer =
        new MutationObserver(
            rebuild
        );


    observer.observe(
        select,
        {
            childList:
                true,

            subtree:
                true
        }
    );


    rebuild();
}


/*
=========================================================
INITIALIZE CUSTOM SELECTS
=========================================================
*/

function initializeCustomSelects() {

    document
        .querySelectorAll(
            "select"
        )
        .forEach(
            enhanceSelect
        );
}


document.addEventListener(
    "DOMContentLoaded",
    initializeCustomSelects
);


/*
Close dropdown when clicking elsewhere.
*/

document.addEventListener(
    "click",
    event => {

        document
            .querySelectorAll(
                ".custom-select.open"
            )
            .forEach(
                wrapper => {

                    if (
                        !wrapper.contains(
                            event.target
                        )
                    ) {

                        wrapper.classList.remove(
                            "open"
                        );


                        const button =
                            wrapper.querySelector(
                                ".custom-select-button"
                            );


                        if (
                            button
                        ) {

                            button.setAttribute(
                                "aria-expanded",
                                "false"
                            );
                        }
                    }

                }
            );

    }
);


/*
Escape closes dropdown.
*/

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            document
                .querySelectorAll(
                    ".custom-select.open"
                )
                .forEach(
                    wrapper => {

                        wrapper
                            .classList
                            .remove(
                                "open"
                            );

                    }
                );
        }

    }
);