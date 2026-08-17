/*
=========================================================
THE DAILY CIPHER
SITE NAVIGATION v2.0
=========================================================

Responsibilities:

- Standardize navigation across public pages
- Highlight current page
- Show Sign In when logged out
- Show @username when logged in
- Load Supabase for nav state when needed
- Preserve theme toggle behavior
- Work from root pages and nested folders
- Avoid duplicate initialization

=========================================================
*/


(() => {


    /*
    =====================================================
    INITIALIZATION GUARD
    =====================================================
    */

    async function initializeNavigation() {

        if (
            window.__tdcNavigationInitialized
        ) {

            return;
        }


        window.__tdcNavigationInitialized =
            true;


        /*
        Leave the admin interface alone.
        */

        if (
            window.location.pathname
                .includes(
                    "/admin/"
                )
        ) {

            return;
        }


        rebuildPublicNavigation();

rebuildHeaderActions();

installAccessibilityBasics();

initializeTheme();

await initializeAccountNavigation();

    }

    /*
=========================================================
ACCESSIBILITY BASICS
=========================================================
*/

function installAccessibilityBasics() {

    /*
    -----------------------------------------------------
    SKIP TO MAIN CONTENT
    -----------------------------------------------------
    */

    const main =
        document.querySelector(
            "main"
        );


    if (
        main
    ) {

        if (
            !main.id
        ) {

            main.id =
                "main-content";
        }


        if (
            !document.querySelector(
                ".skip-link"
            )
        ) {

            const skip =
                document.createElement(
                    "a"
                );


            skip.className =
                "skip-link";


            skip.href =
                `#${main.id}`;


            skip.textContent =
                "Skip to main content";


            document.body
                .insertBefore(
                    skip,
                    document.body.firstChild
                );
        }
    }


    /*
    -----------------------------------------------------
    NAVIGATION LABEL
    -----------------------------------------------------
    */

    const nav =
        document.querySelector(
            ".site-header nav"
        );


    if (
        nav
        &&
        !nav.hasAttribute(
            "aria-label"
        )
    ) {

        nav.setAttribute(
            "aria-label",
            "Primary navigation"
        );
    }


    /*
    -----------------------------------------------------
    THEME BUTTON
    -----------------------------------------------------
    */

    const themeButton =
        document.getElementById(
            "theme-toggle"
        );


    if (
        themeButton
    ) {

        themeButton.setAttribute(
            "aria-label",
            "Toggle light and dark theme"
        );


        if (
            !themeButton.getAttribute(
                "type"
            )
        ) {

            themeButton.type =
                "button";
        }
    }


    /*
    -----------------------------------------------------
    STATS BUTTON
    -----------------------------------------------------
    */

    const statsButton =
        document.getElementById(
            "stats-button"
        );


    if (
        statsButton
    ) {

        statsButton.setAttribute(
            "aria-label",
            "View your statistics"
        );


        if (
            !statsButton.getAttribute(
                "type"
            )
        ) {

            statsButton.type =
                "button";
        }
    }
}

    /*
    =====================================================
    SITE ROOT
    =====================================================
    */

    function getSiteRoot() {

        /*
        Find this script regardless of whether the page used:

            js/navigation.js
            ../js/navigation.js
            /js/navigation.js

        This also keeps the code usable if the site is ever
        hosted from a subdirectory.
        */

        const script =
            Array
                .from(
                    document.scripts
                )
                .find(
                    element =>
                        String(
                            element.src
                            ||
                            ""
                        )
                        .includes(
                            "/js/navigation.js"
                        )
                );


        if (
            script?.src
        ) {

            const url =
                new URL(
                    script.src
                );


            return url
                .pathname
                .replace(
                    /\/js\/navigation\.js.*$/,
                    "/"
                );
        }


        return "/";
    }


    function sitePath(
        path
    ) {

        const root =
            getSiteRoot();


        return (
            root
            +
            String(
                path
                ||
                ""
            )
            .replace(
                /^\/+/,
                ""
            )
        );
    }


    /*
    =====================================================
    STANDARD PUBLIC NAVIGATION
    =====================================================
    */

    function rebuildPublicNavigation() {

        const header =
            document.querySelector(
                ".site-header"
            );


        if (
            !header
        ) {

            return;
        }


        let nav =
            header.querySelector(
                "nav"
            );


        if (
            !nav
        ) {

            nav =
                document.createElement(
                    "nav"
                );


            const logo =
                header.querySelector(
                    ".logo"
                );


            if (
                logo
                &&
                logo.nextSibling
            ) {

                header.insertBefore(
                    nav,
                    logo.nextSibling
                );

            } else {

                header.appendChild(
                    nav
                );
            }
        }

        nav.setAttribute(
    "aria-label",
    "Primary navigation"
);

        const links = [

            {
                label:
                    "Daily",

                href:
                    "index.html",

                section:
                    "daily"
            },

            {
                label:
                    "Learn",

                href:
                    "learn/index.html",

                section:
                    "learn"
            },

            {
                label:
                    "Practice",

                href:
                    "practice/index.html",

                section:
                    "practice"
            },

            {
                label:
                    "Dashboard",

                href:
                    "dashboard/index.html",

                section:
                    "dashboard"
            },

            {
                label:
                    "Leaderboard",

                href:
                    "leaderboard/index.html",

                section:
                    "leaderboard"
            }

        ];


        nav.innerHTML =
            "";


        const currentSection =
            getCurrentSection();


        links.forEach(
            item => {

                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    sitePath(
                        item.href
                    );


                link.textContent =
                    item.label;


                if (
                    item.section ===
                    currentSection
                ) {

                    link.setAttribute(
                        "aria-current",
                        "page"
                    );


                    link.classList.add(
                        "nav-current"
                    );
                }


                nav.appendChild(
                    link
                );

            }
        );


        /*
        Account is always last.
        */

        const account =
            document.createElement(
                "a"
            );


        account.id =
            "nav-account-link";


        account.href =
            sitePath(
                "account/index.html"
            );


        account.textContent =
            "Sign In";


        if (
            currentSection ===
            "account"
        ) {

            account.setAttribute(
                "aria-current",
                "page"
            );


            account.classList.add(
                "nav-current"
            );
        }


        nav.appendChild(
            account
        );
    }

/*
=========================================================
STANDARD HEADER ACTIONS
=========================================================
*/

function rebuildHeaderActions() {

    const header =
        document.querySelector(
            ".site-header"
        );


    if (
        !header
    ) {

        return;
    }


    const currentSection =
        getCurrentSection();


    /*
    -----------------------------------------------------
    GET OR CREATE ACTION AREA
    -----------------------------------------------------
    */

    let actions =
        header.querySelector(
            ".header-actions"
        );


    if (
        !actions
    ) {

        actions =
            document.createElement(
                "div"
            );


        actions.className =
            "header-actions";


        header.appendChild(
            actions
        );
    }


    /*
    -----------------------------------------------------
    DAILY STATS BUTTON

    Stats currently belongs to the Daily page because
    that page owns the statistics modal.

    Leave the existing Daily button intact so its current
    event listeners continue working.
    -----------------------------------------------------
    */

    const existingStats =
        document.getElementById(
            "stats-button"
        );


    if (
        currentSection !==
        "daily"
        &&
        existingStats
    ) {

        existingStats.remove();
    }


    /*
    -----------------------------------------------------
    THEME TOGGLE

    Every public page gets the same theme button.
    -----------------------------------------------------
    */

    let themeToggle =
        document.getElementById(
            "theme-toggle"
        );


    if (
        !themeToggle
    ) {

        themeToggle =
            document.createElement(
                "button"
            );


        themeToggle.id =
            "theme-toggle";


        themeToggle.className =
            "icon-button";


        themeToggle.type =
            "button";


        themeToggle.title =
            "Toggle theme";


        themeToggle.setAttribute(
            "aria-label",
            "Toggle light and dark theme"
        );


        themeToggle.textContent =
            "◐";


        actions.appendChild(
            themeToggle
        );

    } else if (
        themeToggle.parentElement !==
        actions
    ) {

        /*
        If an older page placed the theme toggle somewhere
        else, move it into the standardized action area.
        */

        actions.appendChild(
            themeToggle
        );
    }


    /*
    -----------------------------------------------------
    DAILY STATS POSITION

    Make sure the existing Stats button is before the
    theme toggle.
    -----------------------------------------------------
    */

    if (
        currentSection ===
        "daily"
        &&
        existingStats
    ) {

        if (
            existingStats.parentElement !==
            actions
        ) {

            actions.insertBefore(
                existingStats,
                themeToggle
            );

        } else {

            actions.insertBefore(
                existingStats,
                themeToggle
            );
        }
    }

}
    /*
    =====================================================
    CURRENT SECTION
    =====================================================
    */

    function getCurrentSection() {

        const pathname =
            window.location.pathname
                .toLowerCase();


        if (
            pathname.includes(
                "/leaderboard/"
            )
        ) {

            return "leaderboard";
        }


        if (
            pathname.includes(
                "/dashboard/"
            )
        ) {

            return "dashboard";
        }


        if (
            pathname.includes(
                "/practice/"
            )
        ) {

            return "practice";
        }


        if (
            pathname.includes(
                "/learn/"
            )
        ) {

            return "learn";
        }


        if (
            pathname.includes(
                "/account/"
            )
        ) {

            return "account";
        }


        /*
        Root homepage.
        */

        const file =
            pathname
                .split(
                    "/"
                )
                .pop();


        if (
            file ===
            ""
            ||
            file ===
            "index.html"
        ) {

            return "daily";
        }


        return "";
    }


    /*
    =====================================================
    THEME
    =====================================================
    */

    function initializeTheme() {

        const savedTheme =
            localStorage.getItem(
                "cipherTheme"
            );


        if (
            savedTheme ===
            "light"
        ) {

            document.body
                .classList
                .add(
                    "light-theme"
                );
        }


        const toggle =
            document.getElementById(
                "theme-toggle"
            );


        if (
            !toggle
            ||
            toggle.dataset.navigationBound ===
            "true"
        ) {

            return;
        }


        toggle.dataset.navigationBound =
            "true";


        toggle.addEventListener(
            "click",
            () => {

                document.body
                    .classList
                    .toggle(
                        "light-theme"
                    );


                const light =
                    document.body
                        .classList
                        .contains(
                            "light-theme"
                        );


                localStorage.setItem(
                    "cipherTheme",
                    light
                        ?
                        "light"
                        :
                        "dark"
                );

            }
        );
    }


    /*
    =====================================================
    ACCOUNT NAVIGATION
    =====================================================
    */

    async function initializeAccountNavigation() {

        const accountLink =
            document.getElementById(
                "nav-account-link"
            );


        if (
            !accountLink
        ) {

            return;
        }


        /*
        Older pages currently do not load Supabase.

        Load it automatically so every public page can
        still show @username correctly.
        */

        const ready =
            await ensureSupabaseClient();


        if (
            !ready
        ) {

            showSignedOutNavigation(
                accountLink
            );


            return;
        }


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .auth
                    .getUser();


            if (
                error
                ||
                !data?.user
            ) {

                showSignedOutNavigation(
                    accountLink
                );

            } else {

                await showSignedInNavigation(
                    accountLink,
                    data.user
                );
            }


        } catch (
            error
        ) {

            console.warn(
                "Could not determine navigation auth state:",
                error
            );


            showSignedOutNavigation(
                accountLink
            );
        }


        /*
        React to login/logout without refreshing.
        */

        supabaseClient
            .auth
            .onAuthStateChange(
                (
                    event,
                    session
                ) => {

                    setTimeout(
                        async () => {

                            if (
                                session?.user
                            ) {

                                await showSignedInNavigation(
                                    accountLink,
                                    session.user
                                );

                            } else {

                                showSignedOutNavigation(
                                    accountLink
                                );
                            }

                        },
                        0
                    );

                }
            );
    }


    /*
    =====================================================
    ENSURE SUPABASE
    =====================================================
    */

    async function ensureSupabaseClient() {

        if (
            window.supabaseClient
        ) {

            return true;
        }


        try {

            /*
            Load Supabase JS library when the page does not
            already include it.
            */

            if (
                !window.supabase
            ) {

                await loadScript(
                    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"
                );
            }


            /*
            Load this site's publishable-client config.
            */

            if (
                !window.supabaseClient
            ) {

                await loadScript(
                    sitePath(
                        "js/supabaseClient.js"
                    )
                );
            }


            return Boolean(
                window.supabaseClient
            );


        } catch (
            error
        ) {

            console.warn(
                "Navigation could not initialize Supabase:",
                error
            );


            return false;
        }
    }


    /*
    =====================================================
    SCRIPT LOADER
    =====================================================
    */

    function loadScript(
        src
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                /*
                If an identical script already exists,
                allow the current event loop to finish
                before checking again.
                */

                const existing =
                    Array
                        .from(
                            document.scripts
                        )
                        .find(
                            script =>
                                script.src ===
                                new URL(
                                    src,
                                    window.location.href
                                ).href
                        );


                if (
                    existing
                ) {

                    /*
                    It may already be fully loaded.
                    */

                    if (
                        existing.dataset.loaded ===
                        "true"
                    ) {

                        resolve();


                        return;
                    }


                    existing.addEventListener(
                        "load",
                        resolve,
                        {
                            once:
                                true
                        }
                    );


                    existing.addEventListener(
                        "error",
                        reject,
                        {
                            once:
                                true
                        }
                    );


                    /*
                    Existing scripts loaded before this
                    controller will not fire another load
                    event, so resolve on the next tick.
                    */

                    setTimeout(
                        resolve,
                        0
                    );


                    return;
                }


                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    src;


                script.async =
                    true;


                script.addEventListener(
                    "load",
                    () => {

                        script.dataset.loaded =
                            "true";


                        resolve();

                    },
                    {
                        once:
                            true
                    }
                );


                script.addEventListener(
                    "error",
                    () => {

                        reject(
                            new Error(
                                `Could not load ${src}`
                            )
                        );

                    },
                    {
                        once:
                            true
                    }
                );


                document.head
                    .appendChild(
                        script
                    );

            }
        );
    }


    /*
    =====================================================
    SIGNED OUT
    =====================================================
    */

    function showSignedOutNavigation(
        link
    ) {

        link.textContent =
            "Sign In";


        link.title =
            "Sign in or create an account";


        link.classList.remove(
            "signed-in"
        );
    }


    /*
    =====================================================
    SIGNED IN
    =====================================================
    */

    async function showSignedInNavigation(
        link,
        user
    ) {

        let label =
            "Account";


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from(
                        "profiles"
                    )
                    .select(
                        "username, display_name"
                    )
                    .eq(
                        "id",
                        user.id
                    )
                    .maybeSingle();


            if (
                !error
                &&
                data
            ) {

                if (
                    data.username
                ) {

                    label =
                        `@${data.username}`;

                } else if (
                    data.display_name
                ) {

                    label =
                        data.display_name;
                }
            }


        } catch (
            error
        ) {

            console.warn(
                "Could not load navbar profile:",
                error
            );
        }


        link.textContent =
            label;


        link.title =
            "Open your account";


        link.classList.add(
            "signed-in"
        );
    }


    /*
    =====================================================
    START
    =====================================================
    */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeNavigation,
            {
                once:
                    true
            }
        );

    } else {

        initializeNavigation();
    }


})();