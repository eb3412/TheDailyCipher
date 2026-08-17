/*
=========================================================
THE DAILY CIPHER
CLOUD SYNC v3.0
=========================================================

TWO-WAY CLOUD SYNC

Responsibilities:

- Guest mode remains fully local
- Detect authenticated Supabase user
- Download cloud-only activity
- Restore cloud activity to local history
- Upload local-only activity
- Prevent duplicates
- Preserve local guest progress
- Preserve cloud account progress
- Sync progression summaries
- Sync achievement unlocks
- Retry failed syncs safely

IMPORTANT:

The sync strategy is MERGE, never replace.

If Device A has:
    30 activities

and Supabase has:
    50 activities

after reconciliation the device should contain
the union of both histories, without duplicates.

=========================================================
*/


window.CloudSync = (() => {


    let currentUser =
        null;


    let syncRunning =
        false;


    let syncRequestedAgain =
        false;


    let initialized =
        false;


/*
=========================================================
INITIALIZE
=========================================================
*/

async function initialize() {

    if (
        !window.supabaseClient
    ) {

        console.warn(
            "CloudSync could not find supabaseClient."
        );


        return;
    }


    /*
    Prevent accidental double initialization.
    */

    if (
        initialized
    ) {

        return;
    }


    initialized =
        true;


    bindEvents();


    await refreshUser();


    /*
    If this browser already has a valid session,
    reconcile local and cloud progress immediately.
    */

    if (
        currentUser
    ) {

        await syncNow({

            silent:
                true

        });
    }


    /*
    =====================================================
    AUTH CHANGES
    =====================================================

    Login:
        reconcile account and local history.

    Logout:
        stop using cloud, but DO NOT erase local data.
    =====================================================
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

                        currentUser =
                            session
                                ?.user
                                ||
                                null;


                        if (
                            !currentUser
                        ) {

                            renderSignedOut();


                            return;
                        }


                        await renderStatus();


                        await syncNow({

                            silent:
                                true

                        });

                    },
                    0
                );

            }

        );
}


/*
=========================================================
EVENTS
=========================================================
*/

function bindEvents() {

    const button =
        document.getElementById(
            "cloud-migrate-button"
        );


    if (
        !button
        ||
        button.dataset.bound ===
        "true"
    ) {

        return;
    }


    button.dataset.bound =
        "true";


    button.addEventListener(
        "click",
        () => {

            migrateLocalProgress();

        }
    );
}


/*
=========================================================
USER
=========================================================
*/

async function refreshUser() {

    if (
        !window.supabaseClient
    ) {

        currentUser =
            null;


        return null;
    }


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

        currentUser =
            null;


        renderSignedOut();


        return null;
    }


    currentUser =
        data.user;


    await renderStatus();


    return currentUser;
}


/*
=========================================================
PUBLIC REFRESH
=========================================================
*/

async function refresh() {

    await refreshUser();


    return currentUser;
}


/*
=========================================================
SIGNED-IN CHECK
=========================================================
*/

function isSignedIn() {

    return Boolean(
        currentUser
    );
}


/*
=========================================================
LOCAL ACTIVITY
=========================================================
*/

function getLocalActivity() {

    if (
        typeof getActivityHistory !==
        "function"
    ) {

        console.warn(
            "CloudSync could not find getActivityHistory()."
        );


        return [];
    }


    const history =
        getActivityHistory();


    return Array.isArray(
        history
    )
        ?
        history
        :
        [];
}


/*
=========================================================
LOCAL ACTIVITY IDENTIFIERS
=========================================================
*/

function getLocalActivityIDSet(
    history = getLocalActivity()
) {

    return new Set(

        history
            .map(
                (
                    activity,
                    index
                ) =>
                    getClientActivityID(
                        activity,
                        index
                    )
            )
            .filter(
                Boolean
            )

    );
}


/*
=========================================================
DOWNLOAD CLOUD ACTIVITY
=========================================================
*/

async function getCloudActivities() {

    if (
        !currentUser
    ) {

        return [];
    }


    /*
    Fetch every field necessary to rebuild the
    standardized local activity object.

    RLS limits these rows to currentUser.
    */

    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "activities"
            )
            .select(
                `
                id,
                client_activity_id,
                source,
                cipher,
                difficulty,
                solved,
                score,
                guesses,
                hints,
                time_seconds,
                mode,
                xp_earned,
                activity_date,
                metadata,
                created_at
                `
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .order(
                "created_at",
                {

                    ascending:
                        true

                }
            );


    if (
        error
    ) {

        throw error;
    }


    return Array.isArray(
        data
    )
        ?
        data
        :
        [];
}


/*
=========================================================
CLOUD ACTIVITY IDS
=========================================================
*/

function getCloudActivityIDSet(
    cloudActivities
) {

    return new Set(

        cloudActivities
            .map(
                row =>
                    row.client_activity_id
            )
            .filter(
                Boolean
            )

    );
}


/*
=========================================================
LOCAL → CLOUD MISSING
=========================================================
*/

function getActivitiesMissingFromCloud(
    localHistory,
    cloudIDs
) {

    return localHistory.filter(
        (
            activity,
            index
        ) => {

            const id =
                getClientActivityID(
                    activity,
                    index
                );


            return !cloudIDs.has(
                id
            );

        }
    );
}


/*
=========================================================
CLOUD → LOCAL MISSING
=========================================================
*/

function getActivitiesMissingLocally(
    cloudActivities,
    localIDs
) {

    return cloudActivities.filter(
        row => {

            const id =
                row.client_activity_id;


            if (
                !id
            ) {

                /*
                Old cloud rows without a client ID should
                not normally exist after our schema upgrade.

                Skip them instead of risking duplicates.
                */

                return false;
            }


            return !localIDs.has(
                id
            );

        }
    );
}


/*
=========================================================
MAIN TWO-WAY SYNC
=========================================================

Order matters:

1. Read BOTH sides.
2. Restore cloud-only rows locally.
3. Re-read local history.
4. Upload local-only rows.
5. Recalculate shared progression.
6. Sync achievements.
7. Update user_progress.

This preserves the union of both datasets.
=========================================================
*/

async function syncNow(
    options = {}
) {

    const silent =
        options.silent ===
        true;


    /*
    =====================================================
    GUEST MODE
    =====================================================
    */

    if (
        !currentUser
    ) {

        return {

            signedIn:
                false,

            downloaded:
                0,

            uploaded:
                0,

            success:
                true

        };
    }


    /*
    =====================================================
    CONCURRENT SYNC PROTECTION
    =====================================================
    */

    if (
        syncRunning
    ) {

        syncRequestedAgain =
            true;


        return {

            signedIn:
                true,

            downloaded:
                0,

            uploaded:
                0,

            queued:
                true,

            success:
                true

        };
    }


    syncRunning =
        true;


    let downloaded =
        0;


    let uploaded =
        0;


    try {

        if (
            !silent
        ) {

            setStatus(
                "Reconciling local and cloud progress..."
            );


            setButtonState(
                "saving"
            );
        }


        /*
        =================================================
        STEP 1
        READ LOCAL + CLOUD
        =================================================
        */

        let localHistory =
            getLocalActivity();


        const cloudActivities =
            await getCloudActivities();


        const localIDs =
            getLocalActivityIDSet(
                localHistory
            );


        const cloudIDs =
            getCloudActivityIDSet(
                cloudActivities
            );


        /*
        =================================================
        STEP 2
        CLOUD → LOCAL
        =================================================
        */

        const cloudOnly =
            getActivitiesMissingLocally(
                cloudActivities,
                localIDs
            );


        downloaded =
            cloudOnly.length;


        if (
            cloudOnly.length >
            0
        ) {

            restoreCloudActivitiesLocally(
                cloudOnly
            );
        }


        /*
        IMPORTANT:

        Re-read local history after restore.
        */

        localHistory =
            getLocalActivity();


        /*
        =================================================
        STEP 3
        LOCAL → CLOUD
        =================================================
        */

        const latestCloudIDs =
            getCloudActivityIDSet(
                cloudActivities
            );


        const localOnly =
            getActivitiesMissingFromCloud(
                localHistory,
                latestCloudIDs
            );


        uploaded =
            localOnly.length;


        if (
            localOnly.length >
            0
        ) {

            await uploadActivities(
                localOnly
            );
        }


        /*
        =================================================
        STEP 4
        ACHIEVEMENTS
        =================================================
        */

        await reconcileAchievements();


        /*
        =================================================
        STEP 5
        USER PROGRESS SUMMARY
        =================================================

        Re-read again because restored activities may
        have changed XP/mastery/streak calculations.
        =================================================
        */

        const finalLocalHistory =
            getLocalActivity();


        await uploadProgressSummary(
            finalLocalHistory
        );


        /*
        =================================================
        UI
        =================================================
        */

        if (
            !silent
        ) {

            if (
                downloaded >
                0
                ||
                uploaded >
                0
            ) {

                setStatus(
                    buildSyncSuccessMessage({

                        downloaded,

                        uploaded,

                        total:
                            finalLocalHistory.length

                    })
                );

            } else {

                setStatus(
                    (
                        `Everything is synced. `
                        +
                        `${finalLocalHistory.length} `
                        +
                        (
                            finalLocalHistory.length ===
                            1
                                ?
                                "activity"
                                :
                                "activities"
                        )
                        +
                        ` are available on this device.`
                    )
                );
            }


            setButtonState(
                "saved"
            );
        }


       


        /*
        Let the rest of the site know that local
        activity may have changed.
        */

        dispatchSyncComplete({

            downloaded,

            uploaded

        });


        return {

            signedIn:
                true,

            downloaded,

            uploaded,

            success:
                true

        };


    } catch (
        error
    ) {

        console.error(
            "Cloud reconciliation failed:",
            error
        );


        /*
        Local data remains untouched if a network
        operation fails.

        Any successfully restored rows remain local,
        which is safe because deduplication prevents
        them being restored repeatedly.
        */

        if (
            !silent
        ) {

            setStatus(
                (
                    "Cloud sync could not finish. "
                    +
                    "Your progress remains saved "
                    +
                    "on this device and the site "
                    +
                    "will retry later."
                )
            );


            setButtonState(
                "retry"
            );
        }


        return {

            signedIn:
                true,

            downloaded,

            uploaded,

            success:
                false,

            error

        };


    } finally {

        syncRunning =
            false;


        /*
        Another puzzle may have finished while this
        sync was running.

        Run exactly one more reconciliation if needed.
        */

        if (
            syncRequestedAgain
        ) {

            syncRequestedAgain =
                false;


            setTimeout(
                () => {

                    syncNow({

                        silent:
                            true

                    });

                },
                0
            );
        }
    }
}


/*
=========================================================
MANUAL MIGRATION / SYNC BUTTON
=========================================================
*/

async function migrateLocalProgress() {

    if (
        !currentUser
    ) {

        setStatus(
            "Sign in before syncing progress."
        );


        return;
    }


    return syncNow({

        silent:
            false

    });
}


/*
=========================================================
RESTORE CLOUD ACTIVITY LOCALLY
=========================================================

Cloud rows are converted back into the standardized
local activity structure used by:

- ProgressionEngine
- MasteryEngine
- StreakEngine
- AchievementEngine
- Dashboard

The cloud client_activity_id is carried into metadata
so future reconciliation can recognize the same record.
=========================================================
*/

function restoreCloudActivitiesLocally(
    rows
) {

    if (
        !Array.isArray(
            rows
        )
        ||
        rows.length ===
        0
    ) {

        return;
    }


    if (
        typeof recordActivity !==
        "function"
    ) {

        throw new Error(
            "recordActivity() is unavailable, so cloud history cannot be restored locally."
        );
    }


    /*
    Sort oldest → newest before recording.
    */

    const sorted =
        [
            ...rows
        ]
        .sort(
            (
                a,
                b
            ) => {

                return (
                    new Date(
                        a.created_at
                        ||
                        0
                    )
                    -
                    new Date(
                        b.created_at
                        ||
                        0
                    )
                );

            }
        );


    sorted.forEach(
        row => {

            const restored =
                mapCloudActivityToLocal(
                    row
                );


            recordActivity(
                restored
            );

        }
    );
}


/*
=========================================================
MAP CLOUD → LOCAL
=========================================================
*/

function mapCloudActivityToLocal(
    row
) {

    const metadata =
        (
            row.metadata
            &&
            typeof row.metadata ===
            "object"
        )
            ?
            {
                ...row.metadata
            }
            :
            {};


    /*
    Preserve the authoritative cloud identifier.

    getClientActivityID() in Part 2 will check this
    before looking at the locally generated activity.id.
    */

    metadata.cloudClientActivityId =
        row.client_activity_id;


    metadata.restoredFromCloud =
        true;


    metadata.cloudCreatedAt =
        row.created_at
        ||
        null;


    metadata.xpEarned =
        nonnegativeInteger(
            row.xp_earned
        );


    const originalTimestamp =
        metadata.localTimestamp
        ||
        row.created_at
        ||
        new Date()
            .toISOString();


    return {

        /*
        recordActivity() receives the same field shape
        used by Practice and Daily.
        */

        source:
            normalizeSource(
                row.source
            ),

        cipher:
            String(
                row.cipher
                ||
                "unknown"
            )
            .toLowerCase(),

        difficulty:
            normalizeDifficulty(
                row.difficulty
            ),

        solved:
            row.solved ===
            true,

        score:
            nonnegativeInteger(
                row.score
            ),

        guesses:
            nonnegativeInteger(
                row.guesses
            ),

        hints:
            nonnegativeInteger(
                row.hints
            ),

        timeSeconds:
            nonnegativeInteger(
                row.time_seconds
            ),

        mode:
            row.mode
                ?
                String(
                    row.mode
                )
                :
                null,

        /*
        These are supplied so storage implementations
        that preserve explicit date/timestamp values can
        keep the original historical timing.
        */

        date:
            row.activity_date
            ||
            null,

        timestamp:
            originalTimestamp,

        metadata

    };
}


/*
=========================================================
UPLOAD LOCAL ACTIVITIES
=========================================================
*/

async function uploadActivities(
    activities
) {

    if (
        !currentUser
        ||
        !Array.isArray(
            activities
        )
        ||
        activities.length ===
        0
    ) {

        return;
    }


    const localHistory =
        getLocalActivity();


    const batchSize =
        100;


    for (
        let start = 0;
        start < activities.length;
        start += batchSize
    ) {

        const batch =
            activities.slice(
                start,
                start + batchSize
            );


        const rows =
            batch.map(
                (
                    activity,
                    relativeIndex
                ) => {

                    const originalIndex =
                        localHistory.indexOf(
                            activity
                        );


                    return mapActivityToCloud(

                        activity,

                        originalIndex >=
                        0
                            ?
                            originalIndex
                            :
                            (
                                start
                                +
                                relativeIndex
                            )

                    );

                }
            );


        const {
            error
        } =
            await supabaseClient
                .from(
                    "activities"
                )
                .insert(
                    rows
                );


        if (
            error
        ) {

            /*
            A unique-key race can happen if two tabs sync
            at almost the same time.

            Verify which IDs now exist before treating it
            as a true failure.
            */

            const cloudActivities =
                await getCloudActivities();


            const cloudIDs =
                getCloudActivityIDSet(
                    cloudActivities
                );


            const unresolved =
                rows.filter(
                    row =>
                        !cloudIDs.has(
                            row.client_activity_id
                        )
                );


            if (
                unresolved.length >
                0
            ) {

                throw error;
            }
        }
    }
}


/*
=========================================================
MAP LOCAL → CLOUD
=========================================================
*/

function mapActivityToCloud(
    activity,
    index
) {

    return {

        user_id:
            currentUser.id,

        client_activity_id:
            getClientActivityID(
                activity,
                index
            ),

        source:
            normalizeSource(
                activity.source
            ),

        cipher:
            String(
                activity.cipher
                ||
                "unknown"
            )
            .toLowerCase(),

        difficulty:
            normalizeDifficulty(
                activity.difficulty
            ),

        solved:
            activity.solved ===
            true,

        score:
            nonnegativeInteger(
                activity.score
            ),

        guesses:
            nonnegativeInteger(
                activity.guesses
            ),

        hints:
            nonnegativeInteger(
                activity.hints
            ),

        time_seconds:
            nonnegativeInteger(
                activity.timeSeconds
            ),

        mode:
            activity.mode
                ?
                String(
                    activity.mode
                )
                :
                null,

        xp_earned:
            nonnegativeInteger(

                activity
                    .metadata
                    ?.xpEarned

                ??

                activity.xpEarned

            ),

        activity_date:
            getActivityDate(
                activity
            ),

        metadata: {

            ...(
                activity.metadata
                &&
                typeof activity.metadata ===
                "object"
                    ?
                    activity.metadata
                    :
                    {}
            ),

            localTimestamp:
                activity.timestamp
                ||
                null

        }

    };
}
/*
=========================================================
ACHIEVEMENT RECONCILIATION
=========================================================

Restored activity is already part of local history.

Therefore:

1. AchievementEngine recalculates unlocks locally.
2. We read existing cloud achievement rows.
3. We upload anything newly unlocked locally.

This avoids directly modifying AchievementEngine's
private localStorage state.
=========================================================
*/

async function reconcileAchievements() {

    if (
        !currentUser
        ||
        typeof AchievementEngine ===
        "undefined"
    ) {

        return;
    }


    /*
    Recalculate achievements from the newly merged
    activity history.
    */

    if (
        typeof AchievementEngine.syncUnlocks ===
        "function"
    ) {

        AchievementEngine
            .syncUnlocks();
    }


    if (
        typeof AchievementEngine.getUnlockedAchievements !==
        "function"
    ) {

        return;
    }


    const unlocked =
        AchievementEngine
            .getUnlockedAchievements();


    if (
        !Array.isArray(
            unlocked
        )
        ||
        unlocked.length ===
        0
    ) {

        return;
    }


    /*
    Read achievement IDs already stored in Supabase.
    */

    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "achievement_unlocks"
            )
            .select(
                "achievement_id"
            )
            .eq(
                "user_id",
                currentUser.id
            );


    if (
        error
    ) {

        throw error;
    }


    const existing =
        new Set(

            (
                data
                ||
                []
            )
            .map(
                row =>
                    row.achievement_id
            )
            .filter(
                Boolean
            )

        );


    const missing =
        unlocked.filter(
            achievement =>
                achievement.id
                &&
                !existing.has(
                    achievement.id
                )
        );


    if (
        missing.length ===
        0
    ) {

        return;
    }


    const rows =
        missing.map(
            achievement => ({

                user_id:
                    currentUser.id,

                achievement_id:
                    achievement.id,

                unlocked_at:
                    achievement.unlockedAt
                    ||
                    new Date()
                        .toISOString()

            })
        );


    const {
        error:
            insertError
    } =
        await supabaseClient
            .from(
                "achievement_unlocks"
            )
            .insert(
                rows
            );


    if (
        insertError
    ) {

        /*
        If two tabs happen to insert the same unlock
        simultaneously, re-check before failing.
        */

        const {
            data:
                latest,
            error:
                latestError
        } =
            await supabaseClient
                .from(
                    "achievement_unlocks"
                )
                .select(
                    "achievement_id"
                )
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (
            latestError
        ) {

            throw insertError;
        }


        const latestIDs =
            new Set(

                (
                    latest
                    ||
                    []
                )
                .map(
                    row =>
                        row.achievement_id
                )

            );


        const unresolved =
            missing.filter(
                achievement =>
                    !latestIDs.has(
                        achievement.id
                    )
            );


        if (
            unresolved.length >
            0
        ) {

            throw insertError;
        }
    }
}


/*
=========================================================
USER PROGRESS SUMMARY
=========================================================
*/

async function uploadProgressSummary(
    history
) {

    if (
        !currentUser
    ) {

        return;
    }


    const safeHistory =
        Array.isArray(
            history
        )
            ?
            history
            :
            [];


    const totalAttempts =
        safeHistory.length;


    const totalSolved =
        safeHistory.filter(
            activity =>
                activity.solved ===
                true
        ).length;


    let totalXP =
        0;


    let level =
        1;


    let masterySnapshot =
        {};


    let streakSnapshot =
        {};


    /*
    =====================================================
    XP / LEVEL
    =====================================================
    */

    if (
        typeof ProgressionEngine !==
        "undefined"
        &&
        typeof ProgressionEngine.getProgressSummary ===
        "function"
    ) {

        const progression =
            ProgressionEngine
                .getProgressSummary();


        totalXP =
            nonnegativeInteger(
                progression
                    ?.totalXP
            );


        level =
            Math.max(
                1,
                nonnegativeInteger(
                    progression
                        ?.level
                )
            );
    }


    /*
    =====================================================
    MASTERY
    =====================================================
    */

    if (
        typeof MasteryEngine !==
        "undefined"
    ) {

        try {

            masterySnapshot = {

                overall:
                    typeof MasteryEngine.getOverallMastery ===
                    "function"
                        ?
                        MasteryEngine
                            .getOverallMastery()
                        :
                        {},

                ciphers:
                    typeof MasteryEngine.getAllMastery ===
                    "function"
                        ?
                        MasteryEngine
                            .getAllMastery()
                        :
                        []

            };

        } catch (
            error
        ) {

            console.warn(
                "Could not build mastery snapshot:",
                error
            );
        }
    }


    /*
    =====================================================
    STREAKS
    =====================================================
    */

    if (
        typeof StreakEngine !==
        "undefined"
        &&
        typeof StreakEngine.getStreakSummary ===
        "function"
    ) {

        try {

            streakSnapshot =
                StreakEngine
                    .getStreakSummary();

        } catch (
            error
        ) {

            console.warn(
                "Could not build streak snapshot:",
                error
            );
        }
    }


    /*
    user_progress was already created during our
    account/database setup, so update that user's row.
    */

    const {
        error
    } =
        await supabaseClient
            .from(
                "user_progress"
            )
            .update({

                total_xp:
                    totalXP,

                level,

                total_attempts:
                    totalAttempts,

                total_solved:
                    totalSolved,

                mastery_snapshot:
                    masterySnapshot,

                streak_snapshot:
                    streakSnapshot

            })
            .eq(
                "user_id",
                currentUser.id
            );


    if (
        error
    ) {

        throw error;
    }
}


/*
=========================================================
ACCOUNT PAGE STATUS
=========================================================
*/

async function renderStatus() {

    const card =
        document.getElementById(
            "cloud-sync-card"
        );


    /*
    Most pages do not contain the Account cloud card.
    CloudSync should still function normally there.
    */

    if (
        !card
    ) {

        return;
    }


    if (
        !currentUser
    ) {

        renderSignedOut();


        return;
    }


    card.classList.remove(
        "hidden"
    );


    setText(
        "cloud-sync-title",
        "Cloud Progress"
    );


    setStatus(
        "Checking local and cloud progress..."
    );


    setButtonState(
        "checking"
    );


    try {

        const localHistory =
            getLocalActivity();


        const cloudActivities =
            await getCloudActivities();


        const localIDs =
            getLocalActivityIDSet(
                localHistory
            );


        const cloudIDs =
            getCloudActivityIDSet(
                cloudActivities
            );


        const localOnly =
            getActivitiesMissingFromCloud(
                localHistory,
                cloudIDs
            );


        const cloudOnly =
            getActivitiesMissingLocally(
                cloudActivities,
                localIDs
            );


        /*
        Everything matches.
        */

        if (
            localOnly.length ===
            0
            &&
            cloudOnly.length ===
            0
        ) {

            const total =
                localHistory.length;


            if (
                total ===
                0
            ) {

                setStatus(
                    "No puzzle activity has been recorded yet."
                );


                setButtonState(
                    "empty"
                );

            } else {

                setStatus(
                    (
                        `All ${total} `
                        +
                        (
                            total ===
                            1
                                ?
                                "activity is"
                                :
                                "activities are"
                        )
                        +
                        ` synced to this account.`
                    )
                );


                setButtonState(
                    "saved"
                );
            }


            return;
        }


        /*
        Something differs between device and cloud.
        */

        const pieces =
            [];


        if (
            localOnly.length >
            0
        ) {

            pieces.push(
                `${localOnly.length} waiting to upload`
            );
        }


        if (
            cloudOnly.length >
            0
        ) {

            pieces.push(
                `${cloudOnly.length} waiting to restore`
            );
        }


        setStatus(
            pieces.join(
                " • "
            )
        );


        setButtonState(
            "ready"
        );


    } catch (
        error
    ) {

        console.error(
            "Cloud status error:",
            error
        );


        setStatus(
            "Could not check cloud progress."
        );


        setButtonState(
            "retry"
        );
    }
}


/*
=========================================================
SIGNED OUT UI
=========================================================
*/

function renderSignedOut() {

    const card =
        document.getElementById(
            "cloud-sync-card"
        );


    if (
        card
    ) {

        card.classList.add(
            "hidden"
        );
    }
}


/*
=========================================================
SYNC SUCCESS MESSAGE
=========================================================
*/

function buildSyncSuccessMessage({
    downloaded,
    uploaded,
    total
}) {

    const actions =
        [];


    if (
        downloaded >
        0
    ) {

        actions.push(
            (
                `${downloaded} `
                +
                (
                    downloaded ===
                    1
                        ?
                        "activity restored"
                        :
                        "activities restored"
                )
            )
        );
    }


    if (
        uploaded >
        0
    ) {

        actions.push(
            (
                `${uploaded} `
                +
                (
                    uploaded ===
                    1
                        ?
                        "activity uploaded"
                        :
                        "activities uploaded"
                )
            )
        );
    }


    let message =
        actions.join(
            " • "
        );


    if (
        message
    ) {

        message +=
            ". ";
    }


    message +=
        (
            `${total} total `
            +
            (
                total ===
                1
                    ?
                    "activity is"
                    :
                    "activities are"
            )
            +
            ` now available on this device.`
        );


    return message;
}


/*
=========================================================
BUTTON STATES
=========================================================
*/

function setButtonState(
    state
) {

    const button =
        document.getElementById(
            "cloud-migrate-button"
        );


    if (
        !button
    ) {

        return;
    }


    switch (
        state
    ) {

        case "ready":

            button.disabled =
                false;


            button.textContent =
                "Sync Progress";


            break;


        case "saving":

            button.disabled =
                true;


            button.textContent =
                "Syncing...";


            break;


        case "saved":

            button.disabled =
                true;


            button.textContent =
                "Progress Synced";


            break;


        case "empty":

            button.disabled =
                true;


            button.textContent =
                "Nothing to Sync";


            break;


        case "retry":

            button.disabled =
                false;


            button.textContent =
                "Try Again";


            break;


        default:

            button.disabled =
                true;


            button.textContent =
                "Checking...";

    }
}


/*
=========================================================
ACTIVITY ID
=========================================================

Priority:

1. Restored cloud client_activity_id
2. Normal local activity.id
3. Stable legacy hash

Priority #1 is CRITICAL.

recordActivity() may assign a new local ID while
restoring a cloud activity.

Without cloudClientActivityId, the restored activity
could look like a brand-new activity and immediately
upload back to Supabase as a duplicate.
=========================================================
*/

function getClientActivityID(
    activity,
    index
) {

    const restoredCloudID =
        activity
            ?.metadata
            ?.cloudClientActivityId;


    if (
        restoredCloudID
    ) {

        return String(
            restoredCloudID
        );
    }


    if (
        activity?.id
    ) {

        return String(
            activity.id
        );
    }


    /*
    Legacy history from before activity IDs existed.

    Build a deterministic fallback ID from fields that
    should remain stable for that stored activity.
    */

    const raw =
        [

            activity?.source,

            activity?.cipher,

            activity?.difficulty,

            activity?.timestamp,

            activity?.date,

            activity?.solved,

            activity?.score,

            activity?.guesses,

            activity?.hints,

            activity?.timeSeconds,

            activity?.mode,

            index

        ]
        .join(
            "|"
        );


    return (
        "legacy-"
        +
        simpleHash(
            raw
        )
    );
}


/*
=========================================================
ACTIVITY DATE
=========================================================
*/

function getActivityDate(
    activity
) {

    const explicitDate =
        String(
            activity?.date
            ||
            ""
        );


    if (
        /^\d{4}-\d{2}-\d{2}$/
            .test(
                explicitDate
            )
    ) {

        return explicitDate;
    }


    if (
        activity?.timestamp
    ) {

        const date =
            new Date(
                activity.timestamp
            );


        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {

            return localDateKey(
                date
            );
        }
    }


    return localDateKey(
        new Date()
    );
}


/*
=========================================================
LOCAL DATE KEY
=========================================================
*/

function localDateKey(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth()
            +
            1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        )
        .padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
    );
}


/*
=========================================================
NORMALIZE SOURCE
=========================================================
*/

function normalizeSource(
    value
) {

    const normalized =
        String(
            value
            ||
            ""
        )
        .trim()
        .toLowerCase();


    if (
        normalized ===
        "daily"
    ) {

        return "daily";
    }


    return "practice";
}


/*
=========================================================
NORMALIZE DIFFICULTY
=========================================================
*/

function normalizeDifficulty(
    value
) {

    const normalized =
        String(
            value
            ||
            ""
        )
        .trim()
        .toLowerCase();


    if (
        normalized ===
        "hard"
    ) {

        return "Hard";
    }


    if (
        normalized ===
        "medium"
    ) {

        return "Medium";
    }


    return "Easy";
}


/*
=========================================================
SAFE INTEGER
=========================================================
*/

function nonnegativeInteger(
    value
) {

    const number =
        Number(
            value
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return 0;
    }


    return Math.max(
        0,
        Math.round(
            number
        )
    );
}


/*
=========================================================
SIMPLE STABLE HASH
=========================================================
*/

function simpleHash(
    text
) {

    let hash =
        2166136261;


    const string =
        String(
            text
        );


    for (
        let index = 0;
        index < string.length;
        index++
    ) {

        hash ^=
            string.charCodeAt(
                index
            );


        hash =
            Math.imul(
                hash,
                16777619
            );
    }


    return (
        hash >>> 0
    )
    .toString(
        36
    );
}


/*
=========================================================
SYNC EVENT
=========================================================

Other pages can listen for:

    window.addEventListener(
        "tdc-cloud-sync-complete",
        ...
    );

Useful later for automatically refreshing dashboard UI
after cloud activity is restored.
=========================================================
*/

function dispatchSyncComplete({
    downloaded,
    uploaded
}) {

    try {

        window.dispatchEvent(
            new CustomEvent(
                "tdc-cloud-sync-complete",
                {

                    detail: {

                        downloaded,

                        uploaded,

                        total:
                            getLocalActivity()
                                .length

                    }

                }
            )
        );

    } catch (
        error
    ) {

        /*
        Event dispatch is optional and should never
        break syncing.
        */

        console.warn(
            "Could not dispatch cloud sync event:",
            error
        );
    }
}


/*
=========================================================
STATUS TEXT
=========================================================
*/

function setStatus(
    message
) {

    setText(
        "cloud-sync-status",
        message
    );
}


/*
=========================================================
GENERIC TEXT HELPER
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


/*
=========================================================
PUBLIC API
=========================================================
*/

return {

    initialize,

    refresh,

    syncNow,

    migrateLocalProgress,

    isSignedIn

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

        CloudSync
            .initialize();

    }
);