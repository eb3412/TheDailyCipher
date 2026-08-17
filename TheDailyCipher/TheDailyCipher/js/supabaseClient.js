/*
=========================================================
THE DAILY CIPHER
SUPABASE CLIENT v1.0
=========================================================

This is the browser-side Supabase client.

IMPORTANT:

The publishable key is intentionally safe for frontend use.

Never place any of these here:

- service_role key
- sb_secret_... key
- database password

Security is enforced using Supabase RLS.
=========================================================
*/


(() => {


    /*
    =====================================================
    CONFIG
    =====================================================
    */

    const SUPABASE_URL =
        "https://qhdnvoaknrlyfpgahqyq.supabase.co";


    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_mEMlA4V3W7K9-cKHWIvIwg_CgJHcqfT";


    /*
    =====================================================
    VERIFY CDN
    =====================================================
    */

    if (
        !window.supabase
        ||
        typeof window.supabase.createClient !==
        "function"
    ) {

        console.error(
            "Supabase JS library was not loaded before supabaseClient.js."
        );


        return;
    }


    /*
    =====================================================
    CREATE CLIENT
    =====================================================
    */

    window.supabaseClient =
        window.supabase.createClient(

            SUPABASE_URL,

            SUPABASE_PUBLISHABLE_KEY,

            {

                auth: {

                    persistSession:
                        true,

                    autoRefreshToken:
                        true,

                    detectSessionInUrl:
                        true

                }

            }

        );


    


})();