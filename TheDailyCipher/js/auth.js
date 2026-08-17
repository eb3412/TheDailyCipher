/*
=========================================================
THE DAILY CIPHER
AUTH CONTROLLER v2.1
=========================================================

Authentication remains optional.

Features:

- Signup
- Login
- Logout
- Profile loading
- Username setup
- Username editing
- 30-day username cooldown UI
- Database-enforced username cooldown
- Guest mode

=========================================================
*/


window.AuthController = (() => {


    let currentUser =
        null;


    let currentSession =
        null;


    let authSubscription =
        null;


    let currentProfile =
        null;


    const USERNAME_COOLDOWN_DAYS =
        30;


    /*
    =====================================================
    INITIALIZE
    =====================================================
    */

    async function initialize() {

        if (
            !window.supabaseClient
        ) {

            console.error(
                "AuthController could not find supabaseClient."
            );


            showMessage(
                "Could not connect to the account service.",
                "error"
            );


            return;
        }


        bindEvents();


        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getSession();


        if (
            error
        ) {

            console.error(
                "Could not load auth session:",
                error
            );

        } else {

            currentSession =
                data.session
                ||
                null;


            currentUser =
                currentSession
                    ?.user
                ||
                null;
        }


        await renderAuthState();


        /*
        Auth listener.
        */

        if (
            !authSubscription
        ) {

            const {
                data:
                    listenerData
            } =
                supabaseClient
                    .auth
                    .onAuthStateChange(
                        (
                            event,
                            session
                        ) => {

                            currentSession =
                                session
                                ||
                                null;


                            currentUser =
                                session
                                    ?.user
                                ||
                                null;


                            if (
                                !currentUser
                            ) {

                                currentProfile =
                                    null;
                            }


                            setTimeout(
                                () => {

                                    renderAuthState();

                                },
                                0
                            );


                            

                        }
                    );


            authSubscription =
                listenerData
                    ?.subscription
                ||
                true;
        }


        handleConfirmationResult();
    }


    /*
    =====================================================
    EVENTS
    =====================================================
    */

    function bindEvents() {

        document
            .getElementById(
                "signup-form"
            )
            ?.addEventListener(
                "submit",
                handleSignup
            );


        document
            .getElementById(
                "login-form"
            )
            ?.addEventListener(
                "submit",
                handleLogin
            );


        document
            .getElementById(
                "logout-button"
            )
            ?.addEventListener(
                "click",
                logout
            );


        document
            .getElementById(
                "show-signup-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    showAuthView(
                        "signup"
                    );

                }
            );


        document
            .getElementById(
                "show-login-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    showAuthView(
                        "login"
                    );

                }
            );


        document
            .getElementById(
                "continue-guest-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "../practice/index.html";

                }
            );


        /*
        Username input normalization.
        */

        const usernameInput =
            document.getElementById(
                "account-username-input"
            );


        if (
            usernameInput
            &&
            usernameInput.dataset.bound !==
            "true"
        ) {

            usernameInput.dataset.bound =
                "true";


            usernameInput.addEventListener(
                "input",
                event => {

                    event.target.value =
                        event.target.value
                            .toLowerCase()
                            .replace(
                                /[^a-z0-9_]/g,
                                ""
                            );

                }
            );


            usernameInput.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();


                        saveUsername();
                    }

                }
            );
        }
    }


    /*
    =====================================================
    SIGNUP
    =====================================================
    */

    async function handleSignup(
        event
    ) {

        event.preventDefault();


        clearMessage();


        const displayName =
            document
                .getElementById(
                    "signup-display-name"
                )
                ?.value
                .trim()
            ||
            "";


        const email =
            document
                .getElementById(
                    "signup-email"
                )
                ?.value
                .trim()
                .toLowerCase()
            ||
            "";


        const password =
            document
                .getElementById(
                    "signup-password"
                )
                ?.value
            ||
            "";


        const confirmPassword =
            document
                .getElementById(
                    "signup-confirm-password"
                )
                ?.value
            ||
            "";


        if (
            !displayName
        ) {

            showMessage(
                "Enter a display name.",
                "error"
            );


            return;
        }


        if (
            displayName.length >
            40
        ) {

            showMessage(
                "Display name must be 40 characters or fewer.",
                "error"
            );


            return;
        }


        if (
            !email
        ) {

            showMessage(
                "Enter your email address.",
                "error"
            );


            return;
        }


        if (
            password.length <
            8
        ) {

            showMessage(
                "Use a password with at least 8 characters.",
                "error"
            );


            return;
        }


        if (
            password !==
            confirmPassword
        ) {

            showMessage(
                "The passwords do not match.",
                "error"
            );


            return;
        }


        setFormLoading(
            "signup",
            true
        );


        try {

            const redirectURL =
                (
                    window.location.origin
                    +
                    "/account/index.html"
                );


            const {
                data,
                error
            } =
                await supabaseClient
                    .auth
                    .signUp({

                        email,

                        password,

                        options: {

                            data: {

                                display_name:
                                    displayName

                            },

                            emailRedirectTo:
                                redirectURL

                        }

                    });


            if (
                error
            ) {

                throw error;
            }


            if (
                data.user
                &&
                !data.session
            ) {

                showMessage(
                    "Account created. Check your email and confirm your address before signing in.",
                    "success"
                );


                document
                    .getElementById(
                        "signup-form"
                    )
                    ?.reset();


                return;
            }


            if (
                data.session
            ) {

                currentSession =
                    data.session;


                currentUser =
                    data.user
                    ||
                    data.session.user;


                showMessage(
                    "Account created. You are now signed in.",
                    "success"
                );


                await renderAuthState();
            }


        } catch (
            error
        ) {

            console.error(
                "Signup error:",
                error
            );


            showMessage(
                getFriendlyAuthError(
                    error
                ),
                "error"
            );


        } finally {

            setFormLoading(
                "signup",
                false
            );
        }
    }


    /*
    =====================================================
    LOGIN
    =====================================================
    */

    async function handleLogin(
        event
    ) {

        event.preventDefault();


        clearMessage();


        const email =
            document
                .getElementById(
                    "login-email"
                )
                ?.value
                .trim()
                .toLowerCase()
            ||
            "";


        const password =
            document
                .getElementById(
                    "login-password"
                )
                ?.value
            ||
            "";


        if (
            !email
            ||
            !password
        ) {

            showMessage(
                "Enter your email and password.",
                "error"
            );


            return;
        }


        setFormLoading(
            "login",
            true
        );


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .auth
                    .signInWithPassword({

                        email,

                        password

                    });


            if (
                error
            ) {

                throw error;
            }


            currentSession =
                data.session
                ||
                null;


            currentUser =
                data.user
                ||
                null;


            document
                .getElementById(
                    "login-form"
                )
                ?.reset();


            showMessage(
                "Signed in successfully.",
                "success"
            );


            await renderAuthState();


        } catch (
            error
        ) {

            console.error(
                "Login error:",
                error
            );


            showMessage(
                getFriendlyAuthError(
                    error
                ),
                "error"
            );


        } finally {

            setFormLoading(
                "login",
                false
            );
        }
    }


    /*
    =====================================================
    LOGOUT
    =====================================================
    */

    async function logout() {

        clearMessage();


        const button =
            document.getElementById(
                "logout-button"
            );


        if (
            button
        ) {

            button.disabled =
                true;
        }


        try {

            const {
                error
            } =
                await supabaseClient
                    .auth
                    .signOut();


            if (
                error
            ) {

                throw error;
            }


            currentUser =
                null;


            currentSession =
                null;


            currentProfile =
                null;


            showMessage(
                "Signed out. Guest mode is still available.",
                "success"
            );


            await renderAuthState();


        } catch (
            error
        ) {

            console.error(
                "Logout error:",
                error
            );


            showMessage(
                "Could not sign out. Try again.",
                "error"
            );


        } finally {

            if (
                button
            ) {

                button.disabled =
                    false;
            }
        }
    }


    /*
    =====================================================
    AUTH STATE
    =====================================================
    */

    async function renderAuthState() {

        const signedOut =
            document.getElementById(
                "signed-out-view"
            );


        const signedIn =
            document.getElementById(
                "signed-in-view"
            );


        if (
            currentUser
        ) {

            signedOut
                ?.classList
                .add(
                    "hidden"
                );


            signedIn
                ?.classList
                .remove(
                    "hidden"
                );


            await renderProfile();


        } else {

            signedIn
                ?.classList
                .add(
                    "hidden"
                );


            signedOut
                ?.classList
                .remove(
                    "hidden"
                );
        }
    }


    /*
    =====================================================
    PROFILE
    =====================================================
    */

    async function renderProfile() {

        if (
            !currentUser
        ) {

            return;
        }


        setText(
            "account-email",
            currentUser.email
            ||
            ""
        );


        setText(
            "account-user-id",
            currentUser.id
        );


        setText(
            "account-username",
            "Loading username..."
        );


        let profile =
            null;


        let profileError =
            null;


        for (
            let attempt = 0;
            attempt < 2;
            attempt++
        ) {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from(
                        "profiles"
                    )
                    .select(
                        `
                        display_name,
                        username,
                        username_changed_at,
                        created_at
                        `
                    )
                    .eq(
                        "id",
                        currentUser.id
                    )
                    .maybeSingle();


            if (
                !error
            ) {

                profile =
                    data;


                profileError =
                    null;


                break;
            }


            profileError =
                error;


            if (
                attempt ===
                0
            ) {

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            250
                        )
                );
            }
        }


        currentProfile =
            profile;


        const displayName =
            profile
                ?.display_name
            ||
            currentUser
                .user_metadata
                ?.display_name
            ||
            "Cipher Solver";


        setText(
            "account-display-name",
            displayName
        );


        const input =
            document.getElementById(
                "account-username-input"
            );


        if (
            profile?.username
        ) {

            setText(
                "account-username",
                `@${profile.username}`
            );


            if (
                input
            ) {

                input.value =
                    profile.username;
            }


            applyUsernameCooldown(
                profile
            );


        } else if (
            profileError
        ) {

            console.error(
                "Profile read error:",
                profileError
            );


            setText(
                "account-username",
                "Could not load username"
            );


        } else {

            setText(
                "account-username",
                "Username not set yet"
            );


            if (
                input
            ) {

                input.value =
                    "";


                input.disabled =
                    false;
            }


            setUsernameButtonEnabled(
                true
            );


            setUsernameMessage(
                "Choose your permanent public username.",
                ""
            );
        }
    }


    /*
    =====================================================
    USERNAME COOLDOWN
    =====================================================
    */

    function applyUsernameCooldown(
        profile
    ) {

        const input =
            document.getElementById(
                "account-username-input"
            );


        if (
            !profile?.username
        ) {

            if (
                input
            ) {

                input.disabled =
                    false;
            }


            setUsernameButtonEnabled(
                true
            );


            return;
        }


        const nextChange =
            getNextUsernameChangeDate(
                profile.username_changed_at
            );


        /*
        No timestamp means allow change.

        Normally this should only occur for old data.
        */

        if (
            !nextChange
        ) {

            if (
                input
            ) {

                input.disabled =
                    false;
            }


            setUsernameButtonEnabled(
                true
            );


            return;
        }


        const locked =
            Date.now()
            <
            nextChange.getTime();


        if (
            locked
        ) {

            if (
                input
            ) {

                input.disabled =
                    true;
            }


            setUsernameButtonEnabled(
                false
            );


            setUsernameMessage(
                (
                    "Username changes are locked until "
                    +
                    formatDate(
                        nextChange
                    )
                    +
                    "."
                ),
                ""
            );


        } else {

            if (
                input
            ) {

                input.disabled =
                    false;
            }


            setUsernameButtonEnabled(
                true
            );


            setUsernameMessage(
                "You are eligible to change your username.",
                ""
            );
        }
    }


    /*
    =====================================================
    NEXT USERNAME CHANGE DATE
    =====================================================
    */

    function getNextUsernameChangeDate(
        changedAt
    ) {

        if (
            !changedAt
        ) {

            return null;
        }


        const changed =
            new Date(
                changedAt
            );


        if (
            Number.isNaN(
                changed.getTime()
            )
        ) {

            return null;
        }


        return new Date(
            changed.getTime()
            +
            (
                USERNAME_COOLDOWN_DAYS
                *
                24
                *
                60
                *
                60
                *
                1000
            )
        );
    }


    /*
    =====================================================
    SAVE USERNAME
    =====================================================
    */

    async function saveUsername() {

        if (
            !currentUser
        ) {

            setUsernameMessage(
                "Sign in before choosing a username.",
                "error"
            );


            return;
        }


        const input =
            document.getElementById(
                "account-username-input"
            );


        const button =
            document.getElementById(
                "save-username-button"
            );


        if (
            !input
        ) {

            return;
        }


        /*
        Frontend cooldown check.

        Database trigger remains the real authority.
        */

        if (
            currentProfile
                ?.username
        ) {

            const nextChange =
                getNextUsernameChangeDate(
                    currentProfile
                        .username_changed_at
                );


            if (
                nextChange
                &&
                Date.now()
                <
                nextChange.getTime()
            ) {

                setUsernameMessage(
                    (
                        "You can change your username again on "
                        +
                        formatDate(
                            nextChange
                        )
                        +
                        "."
                    ),
                    "error"
                );


                return;
            }
        }


        const username =
            input.value
                .trim()
                .toLowerCase();


        if (
            username.length <
            3
        ) {

            setUsernameMessage(
                "Username must be at least 3 characters.",
                "error"
            );


            return;
        }


        if (
            username.length >
            20
        ) {

            setUsernameMessage(
                "Username must be 20 characters or fewer.",
                "error"
            );


            return;
        }


        if (
            !/^[a-z0-9_]+$/
                .test(
                    username
                )
        ) {

            setUsernameMessage(
                "Use only lowercase letters, numbers, and underscores.",
                "error"
            );


            return;
        }


        /*
        Don't waste an update if nothing changed.
        */

        if (
            currentProfile?.username
            &&
            username ===
            currentProfile.username
        ) {

            setUsernameMessage(
                "That is already your username.",
                ""
            );


            return;
        }


        if (
            button
        ) {

            button.disabled =
                true;


            button.textContent =
                "Saving...";
        }


        input.disabled =
            true;


        setUsernameMessage(
            "Saving username...",
            ""
        );


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from(
                        "profiles"
                    )
                    .update({

                        username

                    })
                    .eq(
                        "id",
                        currentUser.id
                    )
                    .select(
                        "display_name, username, username_changed_at, created_at"
                    )
                    .single();


            if (
                error
            ) {

                if (
                    error.code ===
                    "23505"
                ) {

                    setUsernameMessage(
                        "That username is already taken.",
                        "error"
                    );


                    input.disabled =
                        false;


                    return;
                }


                /*
                Database trigger cooldown error.
                */

                if (
                    String(
                        error.message
                        ||
                        ""
                    )
                    .toLowerCase()
                    .includes(
                        "30 days"
                    )
                ) {

                    setUsernameMessage(
                        "Username changes are limited to once every 30 days.",
                        "error"
                    );


                    await renderProfile();


                    return;
                }


                throw error;
            }


            if (
                !data?.username
            ) {

                throw new Error(
                    "Username was not returned after saving."
                );
            }


            currentProfile =
                data;


            setText(
                "account-username",
                `@${data.username}`
            );


            input.value =
                data.username;


            setUsernameMessage(
                "Username saved.",
                "success"
            );


            /*
            Apply new 30-day lock immediately.
            */

            applyUsernameCooldown(
                data
            );


            


        } catch (
            error
        ) {

            console.error(
                "Username save error:",
                error
            );


            input.disabled =
                false;


            setUsernameButtonEnabled(
                true
            );


            setUsernameMessage(
                error?.message
                ||
                "Could not save username.",
                "error"
            );
        }
    }


    /*
    =====================================================
    USERNAME BUTTON
    =====================================================
    */

    function setUsernameButtonEnabled(
        enabled
    ) {

        const button =
            document.getElementById(
                "save-username-button"
            );


        if (
            !button
        ) {

            return;
        }


        button.disabled =
            !enabled;


        button.textContent =
            enabled
                ?
                "Save"
                :
                "Locked";
    }


    /*
    =====================================================
    USERNAME MESSAGE
    =====================================================
    */

    function setUsernameMessage(
        text,
        type = ""
    ) {

        const element =
            document.getElementById(
                "username-message"
            );


        if (
            !element
        ) {

            return;
        }


        element.textContent =
            text;


        element.className =
            (
                "username-message"
                +
                (
                    type
                        ?
                        ` ${type}`
                        :
                        ""
                )
            );
    }


    /*
    =====================================================
    DATE FORMAT
    =====================================================
    */

    function formatDate(
        date
    ) {

        return date
            .toLocaleDateString(
                undefined,
                {

                    year:
                        "numeric",

                    month:
                        "long",

                    day:
                        "numeric"

                }
            );
    }


    /*
    =====================================================
    AUTH PANELS
    =====================================================
    */

    function showAuthView(
        view
    ) {

        const signup =
            document.getElementById(
                "signup-panel"
            );


        const login =
            document.getElementById(
                "login-panel"
            );


        if (
            view ===
            "signup"
        ) {

            signup
                ?.classList
                .remove(
                    "hidden"
                );


            login
                ?.classList
                .add(
                    "hidden"
                );


        } else {

            login
                ?.classList
                .remove(
                    "hidden"
                );


            signup
                ?.classList
                .add(
                    "hidden"
                );
        }
    }


    /*
    =====================================================
    EMAIL CONFIRMATION
    =====================================================
    */

    function handleConfirmationResult() {

        const hash =
            window.location.hash
            ||
            "";


        const search =
            window.location.search
            ||
            "";


        if (
            hash.includes(
                "access_token"
            )
            ||
            search.includes(
                "code="
            )
        ) {

            showMessage(
                "Email confirmed. Your account is ready.",
                "success"
            );
        }
    }


    /*
    =====================================================
    FORM LOADING
    =====================================================
    */

    function setFormLoading(
        type,
        loading
    ) {

        const button =
            document.getElementById(
                type ===
                "signup"
                    ?
                    "signup-submit"
                    :
                    "login-submit"
            );


        if (
            !button
        ) {

            return;
        }


        button.disabled =
            loading;


        button.textContent =
            loading
                ?
                (
                    type ===
                    "signup"
                        ?
                        "Creating account..."
                        :
                        "Signing in..."
                )
                :
                (
                    type ===
                    "signup"
                        ?
                        "Create Account"
                        :
                        "Sign In"
                );
    }


    /*
    =====================================================
    GENERAL MESSAGES
    =====================================================
    */

    function showMessage(
        text,
        type = "info"
    ) {

        const element =
            document.getElementById(
                "auth-message"
            );


        if (
            !element
        ) {

            return;
        }


        element.textContent =
            text;


        element.className =
            (
                "auth-message "
                +
                `auth-message-${type}`
            );


        element.classList.remove(
            "hidden"
        );
    }


    function clearMessage() {

        const element =
            document.getElementById(
                "auth-message"
            );


        if (
            !element
        ) {

            return;
        }


        element.textContent =
            "";


        element.className =
            "auth-message hidden";
    }


    /*
    =====================================================
    FRIENDLY ERRORS
    =====================================================
    */

    function getFriendlyAuthError(
        error
    ) {

        const message =
            String(
                error?.message
                ||
                ""
            )
            .toLowerCase();


        if (
            message.includes(
                "email not confirmed"
            )
        ) {

            return (
                "Confirm your email address before signing in."
            );
        }


        if (
            message.includes(
                "invalid login credentials"
            )
        ) {

            return (
                "The email or password is incorrect."
            );
        }


        if (
            message.includes(
                "password"
            )
            &&
            message.includes(
                "weak"
            )
        ) {

            return (
                "Choose a stronger password."
            );
        }


        if (
            message.includes(
                "rate"
            )
        ) {

            return (
                "Too many requests. Try again shortly."
            );
        }


        return (
            error?.message
            ||
            "Something went wrong. Try again."
        );
    }


    /*
    =====================================================
    HELPERS
    =====================================================
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


    function getCurrentUser() {

        return currentUser;
    }


    function isSignedIn() {

        return Boolean(
            currentUser
        );
    }


    /*
    =====================================================
    PUBLIC API
    =====================================================
    */

    return {

        initialize,

        logout,

        saveUsername,

        getCurrentUser,

        isSignedIn,

        renderAuthState

    };


})();


/*
=========================================================
START
=========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        AuthController
            .initialize();

    }
);