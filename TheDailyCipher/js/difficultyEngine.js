/*
=========================================================
THE DAILY CIPHER
Difficulty Engine v4.2 — Competition Context
=========================================================
*/

const DifficultyEngine = (() => {

    const CONFIG = {

        Easy: {

            baseScore:
                100,

            maxGuesses:
                6,

            showCipherName:
                true,

            showCipherFamily:
                true,

            initialInfo:
                "The cipher type and beginner-appropriate givens are shown below. Optional hints are separate.",

            hintPenalties:
                [
                    5,
                    10,
                    20,
                    35
                ],

            guessPenalty:
                5,

            allowedCiphers:
                [
                    "caesar",
                    "atbash",
                    "baconian",
                    "baconian-variant",
                    "aristocrat-k1",
                    "aristocrat-k2",
                    "railfence"
                ],

            messageLength: {

                min:
                    10,

                max:
                    35

            }

        },


        Medium: {

            baseScore:
                250,

            maxGuesses:
                6,

            showCipherName:
                true,

            showCipherFamily:
                false,

            initialInfo:
                "Competition-style givens are shown below. Information intentionally withheld is part of the solve.",

            hintPenalties:
                [
                    10,
                    20,
                    35,
                    55
                ],

            guessPenalty:
                12,

            allowedCiphers:
                [
                    "caesar",
                    "affine",
                    "railfence",
                    "baconian",
                    "baconian-variant",
                    "aristocrat-k1",
                    "aristocrat-k2",
                    "aristocrat-random",
                    "patristocrat-k1",
                    "patristocrat-k2",
                    "xenocrypt-k1",
                    "xenocrypt-k2",
                    "cryptarithm",
                    "porta",
                    "nihilist",
                    "columnar-cryptanalysis",
                    "checkerboard",
                    "homophonic",
                    "hill",
                    "fractionatedmorse-cryptanalysis"
                ],

            messageLength: {

                min:
                    20,

                max:
                    70

            }

        },


        Hard: {

            baseScore:
                500,

            maxGuesses:
                6,

            showCipherName:
                true,

            showCipherFamily:
                false,

            initialInfo:
                "The cipher type is identified, as on a competition question. Difficulty comes from cryptanalysis and limited givens—not hidden instructions.",

            hintPenalties:
                [
                    20,
                    40,
                    75,
                    120
                ],

            guessPenalty:
                25,

            allowedCiphers:
                [
                    "affine",
                    "railfence",
                    "baconian-variant",
                    "aristocrat-random",
                    "patristocrat-k1",
                    "patristocrat-k2",
                    "substitution-k3",
                    "xenocrypt-cryptanalysis",
                    "fractionatedmorse-cryptanalysis",
                    "cryptarithm",
                    "porta-cryptanalysis",
                    "nihilist-cryptanalysis",
                    "columnar-cryptanalysis",
                    "checkerboard-cryptanalysis",
                    "homophonic-cryptanalysis",
                    "hill"
                ],

            messageLength: {

                min:
                    35,

                max:
                    110

            }

        }

    };


    function normalizeDifficulty(
        difficulty
    ) {

        const value =
            String(
                difficulty || ""
            )
            .trim()
            .toLowerCase();


        if (
            value ===
            "easy"
        ) {

            return "Easy";
        }


        if (
            value ===
            "medium"
        ) {

            return "Medium";
        }


        if (
            value ===
            "hard"
        ) {

            return "Hard";
        }


        throw new Error(
            `Unsupported difficulty: ${difficulty}`
        );
    }


    function getConfig(
        difficulty
    ) {

        const normalized =
            normalizeDifficulty(
                difficulty
            );


        return JSON.parse(
            JSON.stringify(
                CONFIG[
                    normalized
                ]
            )
        );
    }


    function isCipherAllowed(
        cipherType,
        difficulty
    ) {

        return getConfig(
            difficulty
        )
        .allowedCiphers
        .includes(
            String(
                cipherType
            )
            .toLowerCase()
        );
    }


    function getAllowedCiphers(
        difficulty
    ) {

        return getConfig(
            difficulty
        )
        .allowedCiphers;
    }


    function getCipherFamily(
        type
    ) {

        const families = {

            caesar:
                "Monoalphabetic substitution",

            atbash:
                "Monoalphabetic substitution",

            affine:
                "Mathematical substitution",

            railfence:
                "Transposition",

            baconian:
                "Binary-style encoding",

            aristocrat:
                "Monoalphabetic substitution",

            substitution:
                "Monoalphabetic substitution",

            patristocrat:
                "Monoalphabetic substitution",

            porta:
                "Polyalphabetic substitution",

            columnar:
                "Transposition",

            nihilist:
                "Polybius / additive cipher",

            hill:
                "Matrix cipher",

            fractionatedmorse:
                "Morse fractionation",

            "baconian-variant":
                "Binary-style encoding",

            "aristocrat-k1":
                "Monoalphabetic substitution",

            "aristocrat-k2":
                "Monoalphabetic substitution",

            "aristocrat-random":
                "Monoalphabetic substitution",

            "patristocrat-k1":
                "Monoalphabetic substitution",

            "patristocrat-k2":
                "Monoalphabetic substitution",

            "substitution-k3":
                "Monoalphabetic substitution",

            "xenocrypt-k1":
                "Spanish monoalphabetic substitution",

            "xenocrypt-k2":
                "Spanish monoalphabetic substitution",

            "xenocrypt-cryptanalysis":
                "Spanish monoalphabetic substitution",

            "fractionatedmorse-cryptanalysis":
                "Morse fractionation",

            "porta-cryptanalysis":
                "Polyalphabetic substitution",

            cryptarithm:
                "Mathematical substitution",

            "nihilist-cryptanalysis":
                "Polybius / additive cipher",

            "columnar-cryptanalysis":
                "Transposition",

            checkerboard:
                "Polybius checkerboard",

            "checkerboard-cryptanalysis":
                "Polybius checkerboard",

            homophonic:
                "Homophonic substitution",

            "homophonic-cryptanalysis":
                "Homophonic substitution"

        };


        return families[
            String(
                type || ""
            )
            .toLowerCase()
        ]
        ||
        "Classical cryptography";
    }


    function createInitialInfo(
        puzzle
    ) {

        const difficulty =
            normalizeDifficulty(
                puzzle.difficulty
            );


        const config =
            getConfig(
                difficulty
            );


        const type =
            puzzle.type
            ||
            puzzle.cipher_id;


        return {

            difficulty,

            title:
                `${difficulty.toUpperCase()} CHALLENGE`,

            message:
                config.initialInfo,

            cipherName:
                config.showCipherName
                    ?
                    (
                        puzzle.cipher_type
                        ||
                        (
                            window.CipherEngine
                            ?
                            CipherEngine
                                .getDisplayName(
                                    type
                                )
                            :
                            null
                        )
                    )
                    :
                    null,

            cipherFamily:
                config.showCipherFamily
                    ?
                    getCipherFamily(
                        type
                    )
                    :
                    null

        };
    }


    function prepareHints(
        puzzle
    ) {

        const config =
            getConfig(
                puzzle.difficulty
            );


        const hints =
            Array.isArray(
                puzzle.hints
            )
            ?
            puzzle.hints
            :
            [];


        return hints.map(
            (
                hint,
                index
            ) => ({

                ...hint,

                index,

                revealed:
                    false,

                penalty:
                    config
                        .hintPenalties[
                            index
                        ]
                    ??
                    config
                        .hintPenalties[
                            config
                                .hintPenalties
                                .length
                            -
                            1
                        ]

            })
        );
    }


    function revealHint(
        hints,
        index
    ) {

        if (
            !Array.isArray(
                hints
            )
            ||
            !hints[
                index
            ]
        ) {

            return null;
        }


        hints[
            index
        ].revealed =
            true;


        return hints[
            index
        ];
    }


    function getHintPenalty(
        difficulty,
        index
    ) {

        const penalties =
            getConfig(
                difficulty
            )
            .hintPenalties;


        return penalties[
            index
        ]
        ??
        penalties[
            penalties.length - 1
        ];
    }


    function calculateScore({
        difficulty,
        guessesUsed = 1,
        hintsUsed = []
    }) {

        const config =
            getConfig(
                difficulty
            );


        let score =
            config.baseScore;


        const extraGuesses =
            Math.max(
                0,
                Number(
                    guessesUsed
                )
                -
                1
            );


        score -=
            (
                extraGuesses
                *
                config.guessPenalty
            );


        for (
            const index
            of
            (
                Array.isArray(
                    hintsUsed
                )
                ?
                hintsUsed
                :
                []
            )
        ) {

            score -=
                getHintPenalty(
                    difficulty,
                    index
                );
        }


        return Math.max(
            0,
            Math.round(
                score
            )
        );
    }


    function calculatePerfectScore(
        difficulty
    ) {

        return getConfig(
            difficulty
        )
        .baseScore;
    }


    function createResult({
        difficulty,
        solved,
        guessesUsed,
        hintsUsed = []
    }) {

        const config =
            getConfig(
                difficulty
            );


        return {

            difficulty:
                normalizeDifficulty(
                    difficulty
                ),

            solved:
                Boolean(
                    solved
                ),

            guessesUsed:
                Number(
                    guessesUsed
                ),

            maxGuesses:
                config.maxGuesses,

            hintsUsed:
                [...hintsUsed],

            hintCount:
                hintsUsed.length,

            score:
                solved
                    ?
                    calculateScore({

                        difficulty,

                        guessesUsed,

                        hintsUsed

                    })
                    :
                    0,

            perfectScore:
                config.baseScore

        };
    }


    function createGuessBlocks(
        result
    ) {

        const max =
            result.maxGuesses
            ||
            6;


        if (
            !result.solved
        ) {

            return "🟥".repeat(
                max
            );
        }


        const used =
            Math.min(
                result.guessesUsed,
                max
            );


        return (
            "🟩".repeat(
                used
            )
            +
            "⬜".repeat(
                Math.max(
                    0,
                    max - used
                )
            )
        );
    }


    function createCompactResultText(
        result
    ) {

        const guessText =
            result.solved
                ?
                `${result.guessesUsed}/${result.maxGuesses}`
                :
                `X/${result.maxGuesses}`;


        return (
            `${result.difficulty.toUpperCase()}\n`
            +
            `${createGuessBlocks(result)} ${guessText}\n`
            +
            `💡 ${result.hintCount} hint`
            +
            (
                result.hintCount === 1
                    ?
                    ""
                    :
                    "s"
            )
            +
            ` • ${result.score} pts`
        );
    }


    function getDifficultyDescription(
        difficulty
    ) {

        const descriptions = {

            Easy:
                "Designed for newer solvers with the cipher identified.",

            Medium:
                "Requires familiarity with classical cryptography and hides key information.",

            Hard:
                "Designed for experienced solvers; cipher identification may be required."

        };


        return descriptions[
            normalizeDifficulty(
                difficulty
            )
        ];
    }


    function selfTest() {

        console.group(
            "Difficulty Engine v2 Test"
        );


        let passed =
            0;

        let failed =
            0;


        function test(
            name,
            condition
        ) {

            if (
                condition
            ) {

                console.log(
                    `✅ ${name}`
                );

                passed++;

            } else {

                console.error(
                    `❌ ${name}`
                );

                failed++;
            }
        }


        test(
            "Easy shows cipher name",
            getConfig(
                "Easy"
            ).showCipherName
            ===
            true
        );


        test(
            "Hard hides cipher name",
            getConfig(
                "Hard"
            ).showCipherName
            ===
            false
        );


        test(
            "Caesar allowed Easy",
            isCipherAllowed(
                "caesar",
                "Easy"
            )
        );


        test(
            "Nihilist allowed Medium",
            isCipherAllowed(
                "nihilist",
                "Medium"
            )
        );


        test(
            "Hill allowed Medium",
            isCipherAllowed(
                "hill",
                "Medium"
            )
        );


        test(
            "Fractionated Morse allowed Hard",
            isCipherAllowed(
                "fractionatedmorse",
                "Hard"
            )
        );


        test(
            "Aristocrat not Easy",
            !isCipherAllowed(
                "aristocrat",
                "Easy"
            )
        );


        test(
            "Perfect Easy score",
            calculateScore({

                difficulty:
                    "Easy",

                guessesUsed:
                    1,

                hintsUsed:
                    []

            })
            ===
            100
        );


        test(
            "Hints lower score",
            calculateScore({

                difficulty:
                    "Medium",

                guessesUsed:
                    1,

                hintsUsed:
                    [0]

            })
            <
            250
        );


        console.log(
            `Passed: ${passed}`
        );


        console.log(
            `Failed: ${failed}`
        );


        console.groupEnd();


        return {

            passed,

            failed

        };
    }


    return {

        getConfig,

        getAllowedCiphers,

        isCipherAllowed,

        createInitialInfo,

        prepareHints,

        revealHint,

        getHintPenalty,

        calculateScore,

        calculatePerfectScore,

        createResult,

        createGuessBlocks,

        createCompactResultText,

        getDifficultyDescription,

        selfTest

    };

})();


window.DifficultyEngine =
    DifficultyEngine;