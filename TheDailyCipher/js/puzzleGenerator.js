/*
=========================================================
THE DAILY CIPHER
Puzzle Generator v3.0 — Codebusters Expansion
=========================================================
*/

const PuzzleGenerator = (() => {

    let phraseBank =
        [];


    const usedPhraseIDs =
        new Set();


    const FALLBACK_PHRASES = {

        Easy:
            [
                "CRACK THE CODE"
            ],

        Medium:
            [
                "FREQUENCY ANALYSIS CAN REVEAL LETTER PATTERNS"
            ],

        Hard:
            [
                "SUCCESSFUL CRYPTANALYSIS DEPENDS ON COMBINING MULTIPLE CLUES"
            ]

    };


    const SPANISH_PHRASES = {

        Easy: [
            "BUSCA LA CLAVE OCULTA",
            "MIRA CADA LETRA",
            "SIGUE EL PATRON",
            "LEE EL MENSAJE",
            "PIENSA CON CALMA",
            "LA RESPUESTA ESTA CERCA",
            "CUENTA CADA SIMBOLO",
            "ENCUENTRA LA PALABRA"
        ],

        Medium: [
            "LAS PISTAS PEQUEÑAS PUEDEN REVELAR UN PATRON IMPORTANTE",
            "UN BUEN SOLUCIONADOR COMPARA TODAS LAS LETRAS ANTES DE ADIVINAR",
            "EL MENSAJE PARECE EXTRAÑO PERO TODAVIA SIGUE UNA REGLA",
            "LAS LETRAS REPETIDAS PUEDEN AYUDAR A ENCONTRAR LA RESPUESTA",
            "LA MEJOR ESTRATEGIA EMPIEZA CON UNA OBSERVACION CUIDADOSA",
            "UNA SOLA PISTA PUEDE CAMBIAR LA FORMA DE VER TODO EL MENSAJE",
            "EL VIEJO MAPA TENIA UNA MARCA JUNTO AL PUENTE",
            "LA CARTA LLEGO SIN NOMBRE Y CON UNA FECHA EXTRAÑA"
        ],

        Hard: [
            "CUANDO UN MENSAJE PARECE COMPLETAMENTE ALEATORIO CONVIENE BUSCAR LA REGLA QUE PODRIA HABERLO PRODUCIDO",
            "UNA EXPLICACION FUERTE DEBE FUNCIONAR CON TODO EL MENSAJE Y NO SOLAMENTE CON UNA PARTE PEQUEÑA",
            "SI EL PRIMER METODO FALLA TODAVIA PUEDE ENSEÑARTE QUE POSIBILIDADES DEBES ELIMINAR",
            "LA ESTRUCTURA DEL IDIOMA DEJA PISTAS AUN CUANDO LAS LETRAS HAN SIDO CAMBIADAS POR COMPLETO",
            "CUANDO DOS IDEAS PARECEN POSIBLES PRUEBA CUAL EXPLICA MEJOR TODOS LOS DETALLES DEL TEXTO",
            "EL CUADERNO ANTIGUO CONTENIA VARIAS FECHAS QUE PARECIAN NO TENER RELACION ENTRE SI"
        ]

    };


    /*
    =====================================================
    PHRASE DATABASE
    =====================================================
    */

    async function loadPhraseBank(
        url
    ) {

        try {

            const response =
                await fetch(
                    url
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    `Phrase database HTTP ${response.status}`
                );
            }


            const data =
                await response.json();


            const validation =
                validatePhraseBank(
                    data
                );


            if (
                !validation.valid
            ) {

                console.error(
                    validation.errors
                );


                throw new Error(
                    "Phrase database validation failed."
                );
            }


            phraseBank =
                data.map(
                    normalizePhraseRecord
                );


            usedPhraseIDs.clear();


            


            return {

                loaded:
                    true,

                count:
                    phraseBank.length

            };


        } catch (error) {

            console.error(
                "Phrase bank loading failed:",
                error
            );


            phraseBank =
                [];


            return {

                loaded:
                    false,

                count:
                    0,

                error:
                    error.message

            };
        }
    }


    function validatePhraseBank(
        bank
    ) {

        const errors =
            [];


        if (
            !Array.isArray(
                bank
            )
        ) {

            return {

                valid:
                    false,

                errors:
                    [
                        "Phrase database must be an array."
                    ]

            };
        }


        const ids =
            new Set();


        bank.forEach(
            (
                phrase,
                index
            ) => {

                const label =
                    `Phrase ${index + 1}`;


                if (
                    !phrase.id
                ) {

                    errors.push(
                        `${label}: missing id`
                    );

                } else if (
                    ids.has(
                        phrase.id
                    )
                ) {

                    errors.push(
                        `${label}: duplicate id`
                    );

                } else {

                    ids.add(
                        phrase.id
                    );
                }


                if (
                    typeof phrase.text
                    !==
                    "string"
                    ||
                    !phrase.text.trim()
                ) {

                    errors.push(
                        `${label}: invalid text`
                    );
                }


                try {
                    normalizeDifficulty(
                        phrase.difficulty
                    );
                } catch (error) {
                    errors.push(
                        `${label}: invalid difficulty`
                    );
                }


                /*
                allowedCiphers is optional in v3.
                If omitted, the phrase is treated as general-purpose
                and may be used by any compatible cipher.
                */

                if (
                    phrase.allowedCiphers
                    !==
                    undefined
                    &&
                    !Array.isArray(
                        phrase.allowedCiphers
                    )
                ) {

                    errors.push(
                        `${label}: allowedCiphers must be an array when provided`
                    );
                }

            }
        );


        return {

            valid:
                errors.length
                ===
                0,

            errors

        };
    }


    /*
    =====================================================
    HELPERS
    =====================================================
    */

    function normalizeDifficulty(
        difficulty
    ) {

        const value =
            String(
                difficulty || ""
            )
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
            `Invalid difficulty: ${difficulty}`
        );
    }


    function normalizePhraseRecord(
        phrase
    ) {

        return {

            ...phrase,

            difficulty:
                normalizeDifficulty(
                    phrase.difficulty
                ),

            allowedCiphers:
                Array.isArray(
                    phrase.allowedCiphers
                )
                    ?
                    phrase.allowedCiphers
                        .map(
                            value =>
                                String(value)
                                    .toLowerCase()
                        )
                    :
                    []

        };
    }


    function isXenocryptType(
        type
    ) {

        return String(type || "")
            .toLowerCase()
            .startsWith(
                "xenocrypt"
            );
    }


    function randomItem(
        array
    ) {

        return array[
            Math.floor(
                Math.random()
                *
                array.length
            )
        ];
    }


    function randomInteger(
        min,
        max
    ) {

        return Math.floor(
            Math.random()
            *
            (
                max - min + 1
            )
        )
        +
        min;
    }


    function generateID() {

        return (
            Date.now()
            +
            Math.floor(
                Math.random()
                *
                100000
            )
        );
    }


    function getLetterCount(
        text
    ) {

        return String(
            text || ""
        )
        .toUpperCase()
        .replace(
            /[^A-Z]/g,
            ""
        )
        .length;
    }


    /*
    =====================================================
    PHRASE SELECTION
    =====================================================
    */

    function getEligiblePhrases(
        difficulty,
        cipherType
    ) {

        const normalized =
            normalizeDifficulty(
                difficulty
            );


        const type =
            String(
                cipherType
            )
            .toLowerCase();


        if (
            phraseBank.length
            ===
            0
        ) {

            return (
                FALLBACK_PHRASES[
                    normalized
                ]
                ||
                []
            )
            .map(
                (
                    text,
                    index
                ) => ({

                    id:
                        `fallback-${normalized}-${index}`,

                    text,

                    difficulty:
                        normalized,

                    allowedCiphers:
                        [
                            type
                        ]

                })
            );
        }


        const config =
            DifficultyEngine
                .getConfig(
                    normalized
                );


        return phraseBank.filter(
            phrase => {

                if (
                    phrase.difficulty
                    !==
                    normalized
                ) {

                    return false;
                }


                if (
                    phrase.allowedCiphers.length
                    >
                    0
                    &&
                    !phrase.allowedCiphers
                        .includes(
                            type
                        )
                ) {

                    return false;
                }


                const length =
                    getLetterCount(
                        phrase.text
                    );


                return (
                    length
                    >=
                    config
                        .messageLength
                        .min
                    &&
                    length
                    <=
                    config
                        .messageLength
                        .max
                );

            }
        );
    }


    function choosePlaintext(
    difficulty,
    cipherType
) {

    const normalized =
        normalizeDifficulty(
            difficulty
        );


    const type =
        String(
            cipherType
        )
        .toLowerCase();


    if (
        isXenocryptType(
            type
        )
    ) {

        return randomItem(
            SPANISH_PHRASES[
                normalized
            ]
            ||
            SPANISH_PHRASES.Medium
        );
    }


    /*
    First choice:
    phrases explicitly approved
    for this exact cipher.
    */

    let eligible =
        getEligiblePhrases(
            normalized,
            type
        );


    /*
    FALLBACK

    If no phrase is explicitly tagged
    for this cipher, use any phrase of
    the same difficulty that satisfies
    the length requirements.

    This prevents one missing content tag
    from crashing the entire scheduler.
    */

    if (
        eligible.length === 0
        &&
        phraseBank.length > 0
    ) {

        const config =
            DifficultyEngine
                .getConfig(
                    normalized
                );


        eligible =
            phraseBank.filter(
                phrase => {

                    if (
                        phrase.difficulty
                        !==
                        normalized
                    ) {

                        return false;
                    }


                    const length =
                        getLetterCount(
                            phrase.text
                        );


                    return (
                        length
                        >=
                        config
                            .messageLength
                            .min
                        &&
                        length
                        <=
                        config
                            .messageLength
                            .max
                    );

                }
            );


        if (
            eligible.length > 0
        ) {

            console.warn(
                `No ${normalized} phrases were explicitly tagged for ${type}. ` +
                `Using a general ${normalized} phrase instead.`
            );
        }
    }


    /*
    Final fallback database.
    */

    if (
        eligible.length === 0
    ) {

        const fallback =
            FALLBACK_PHRASES[
                normalized
            ];


        if (
            fallback
            &&
            fallback.length > 0
        ) {

            return randomItem(
                fallback
            );
        }


        throw new Error(
            `No usable ${normalized} plaintext exists for ${type}.`
        );
    }


    /*
    Prefer phrases that have not already
    been used during this browser session.
    */

    let choices =
        eligible.filter(
            phrase =>
                !usedPhraseIDs.has(
                    phrase.id
                )
        );


    /*
    If every eligible phrase has already
    been used, allow reuse rather than
    breaking generation.
    */

    if (
        choices.length === 0
    ) {

        choices =
            eligible;
    }


    const selected =
        randomItem(
            choices
        );


    if (
        selected.id
    ) {

        usedPhraseIDs.add(
            selected.id
        );
    }


    return selected.text;
}


    /*
    =====================================================
    PARAMETERS
    =====================================================
    */

    function generateParameters(
        type,
        difficulty
    ) {

        const normalized =
            normalizeDifficulty(
                difficulty
            );


        const cipherType =
            String(type)
                .toLowerCase();


        if (
            cipherType ===
            "caesar"
        ) {

            if (
                normalized ===
                "Easy"
            ) {

                return {

                    shift:
                        randomItem(
                            [
                                2,
                                3,
                                4,
                                5,
                                6
                            ]
                        )

                };
            }


            return {

                shift:
                    randomInteger(
                        1,
                        25
                    )

            };
        }


        if (
            cipherType ===
            "atbash"
            ||
            cipherType ===
            "baconian"
            ||
            cipherType ===
            "cryptarithm"
        ) {

            return {};
        }


        return CipherEngine
            .generateKey(
                cipherType,
                normalized
            );
    }


    /*
    =====================================================
    CIPHER SELECTION
    =====================================================
    */

    function chooseCipher(
        difficulty
    ) {

        const allowed =
            DifficultyEngine
                .getAllowedCiphers(
                    difficulty
                );


        if (
            allowed.length ===
            0
        ) {

            throw new Error(
                `No ciphers available for ${difficulty}.`
            );
        }


        return randomItem(
            allowed
        );
    }


    /*
    =====================================================
    GENERATE ONE PUZZLE
    =====================================================
    */

    function generate(
        options = {}
    ) {

        const difficulty =
            normalizeDifficulty(
                options.difficulty
                ||
                "Easy"
            );


        const type =
            String(
                options.type
                ||
                chooseCipher(
                    difficulty
                )
            )
            .toLowerCase();


        if (
            !DifficultyEngine
                .isCipherAllowed(
                    type,
                    difficulty
                )
        ) {

            throw new Error(
                `${type} is not allowed for ${difficulty}.`
            );
        }


        const plaintext =
            String(
                options.plaintext
                ||
                choosePlaintext(
                    difficulty,
                    type
                )
            )
            .toUpperCase()
            .trim();


        const parameters =
            options.parameters
            ||
            generateParameters(
                type,
                difficulty
            );


        const generated =
            CipherEngine.generate({

                type,

                plaintext,

                difficulty,

                parameters

            });


        return {

            id:
                options.id
                ??
                generateID(),

            date:
                options.date
                ||
                null,

            difficulty,

            cipher_id:
                type,

            cipher_type:
                CipherEngine
                    .getDisplayName(
                        type
                    ),

            plaintext:
                generated.plaintext,

            ciphertext:
                generated.ciphertext,

            solution:
                generated.plaintext,

            parameters:
                generated.parameters,

            hints:
                generated.hints,

            challengeInfo:
                generated.challengeInfo
                ||
                [],

            metadata: {

                generatorVersion:
                    "3.0",

                generatedAt:
                    new Date()
                        .toISOString()

            }

        };
    }


    /*
    =====================================================
    DAILY SET
    =====================================================
    */

    function generateDailySet(
        options = {}
    ) {

        const date =
            options.date
            ||
            null;


        const difficulties =
            [
                "Easy",
                "Medium",
                "Hard"
            ];


        const usedTypes =
            new Set();


        const puzzles =
            [];


        for (
            const difficulty
            of difficulties
        ) {

            const allowed =
                DifficultyEngine
                    .getAllowedCiphers(
                        difficulty
                    );


            const unused =
                allowed.filter(
                    type =>
                        !usedTypes.has(
                            type
                        )
                );


            const pool =
                unused.length
                    ?
                    unused
                    :
                    allowed;


            const chosenType =
                randomItem(
                    pool
                );


            usedTypes.add(
                chosenType
            );


            puzzles.push(
                generate({

                    difficulty,

                    date,

                    type:
                        chosenType

                })
            );
        }


        return puzzles;
    }


    /*
    =====================================================
    VALIDATION
    =====================================================
    */

    function validatePuzzle(
        puzzle
    ) {

        const errors =
            [];


        if (
            !puzzle
            ||
            typeof puzzle
            !==
            "object"
        ) {

            return {

                valid:
                    false,

                errors:
                    [
                        "Puzzle must be an object."
                    ]

            };
        }


        if (
            !puzzle.difficulty
        ) {

            errors.push(
                "Missing difficulty."
            );
        }


        if (
            !puzzle.cipher_id
        ) {

            errors.push(
                "Missing cipher_id."
            );
        }


        if (
            !puzzle.ciphertext
        ) {

            errors.push(
                "Missing ciphertext."
            );
        }


        if (
            !puzzle.solution
        ) {

            errors.push(
                "Missing solution."
            );
        }


        if (
            !Array.isArray(
                puzzle.hints
            )
        ) {

            errors.push(
                "Hints must be an array."
            );
        }


        if (
            puzzle.cipher_id
            &&
            puzzle.solution
            &&
            puzzle.parameters
            &&
            puzzle.cipher_id
            !==
            "cryptarithm"
        ) {

            try {

                const expected =
                    CipherEngine
                        .encrypt(
                            puzzle.cipher_id,
                            puzzle.solution,
                            puzzle.parameters
                        );


                if (
                    expected
                    !==
                    puzzle.ciphertext
                ) {

                    errors.push(
                        "Ciphertext does not match solution and parameters."
                    );
                }


            } catch (
                error
            ) {

                errors.push(
                    `Encryption validation failed: ${error.message}`
                );
            }
        }


        return {

            valid:
                errors.length
                ===
                0,

            errors

        };
    }


    /*
    =====================================================
    JSON
    =====================================================
    */

    function toJSON(
        puzzle
    ) {

        return JSON.stringify(
            puzzle,
            null,
            4
        );
    }


    function dailySetToJSON(
        puzzles
    ) {

        return JSON.stringify(
            puzzles,
            null,
            4
        );
    }


    /*
    =====================================================
    DATABASE UTILITIES
    =====================================================
    */

    function getPhraseBankStatus() {

        return {

            loaded:
                phraseBank.length
                >
                0,

            total:
                phraseBank.length,

            usedThisSession:
                usedPhraseIDs.size

        };
    }


    function getPhraseCounts() {

        const counts = {

            Easy:
                0,

            Medium:
                0,

            Hard:
                0

        };


        phraseBank.forEach(
            phrase => {

                if (
                    counts[
                        phrase.difficulty
                    ]
                    !==
                    undefined
                ) {

                    counts[
                        phrase.difficulty
                    ]++;
                }
            }
        );


        return counts;
    }


    function resetUsedPhrases() {

        usedPhraseIDs.clear();
    }


    /*
    =====================================================
    SELF TEST
    =====================================================
    */

    function selfTest() {

        console.group(
            "Puzzle Generator v2 Test"
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


        const caesar =
            generate({

                type:
                    "caesar",

                difficulty:
                    "Easy",

                plaintext:
                    "HELLO WORLD",

                parameters: {
                    shift:
                        3
                }

            });


        test(
            "Caesar generated",
            caesar.ciphertext
            ===
            "KHOOR ZRUOG"
        );


        test(
            "Caesar validates",
            validatePuzzle(
                caesar
            ).valid
        );


        const nihilist =
            generate({

                type:
                    "nihilist",

                difficulty:
                    "Medium",

                plaintext:
                    "HELLO WORLD",

                parameters: {

                    squareKeyword:
                        "CIPHER",

                    additiveKeyword:
                        "SECRET"

                }

            });


        test(
            "Nihilist validates",
            validatePuzzle(
                nihilist
            ).valid
        );


        const hill =
            generate({

                type:
                    "hill",

                difficulty:
                    "Medium",

                plaintext:
                    "HELP",

                parameters: {

                    matrix:
                        [
                            [3, 3],
                            [2, 5]
                        ]

                }

            });


        test(
            "Hill generated",
            hill.ciphertext
            ===
            "HIAT"
        );


        test(
            "Hill validates",
            validatePuzzle(
                hill
            ).valid
        );


        const morse =
            generate({

                type:
                    "fractionatedmorse",

                difficulty:
                    "Medium",

                plaintext:
                    "HELLO WORLD",

                parameters: {

                    keyword:
                        "CIPHER"

                }

            });


        test(
            "Fractionated Morse validates",
            validatePuzzle(
                morse
            ).valid
        );


        const daily =
            generateDailySet({

                date:
                    "2026-08-12"

            });


        test(
            "Daily set has 3",
            daily.length
            ===
            3
        );


        test(
            "Daily difficulties unique",
            new Set(
                daily.map(
                    puzzle =>
                        puzzle.difficulty
                )
            ).size
            ===
            3
        );


        test(
            "Daily cipher types unique",
            new Set(
                daily.map(
                    puzzle =>
                        puzzle.cipher_id
                )
            ).size
            ===
            3
        );


        test(
            "Daily set validates",
            daily.every(
                puzzle =>
                    validatePuzzle(
                        puzzle
                    ).valid
            )
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

        generate,

        generateDailySet,

        validatePuzzle,

        toJSON,

        dailySetToJSON,

        choosePlaintext,

        chooseCipher,

        generateParameters,

        loadPhraseBank,

        validatePhraseBank,

        getPhraseBankStatus,

        getPhraseCounts,

        resetUsedPhrases,

        selfTest

    };

})();


window.PuzzleGenerator =
    PuzzleGenerator;