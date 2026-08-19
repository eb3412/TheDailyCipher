/*
=========================================================
THE DAILY CIPHER
Puzzle Generator v4.2 — Competition Context
=========================================================
*/

const PuzzleGenerator = (() => {

    let phraseBank =
        [];


    const usedPhraseIDs =
        new Set();

    const usedSpanishPhrases =
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
            "UN BUEN DESCIFRADOR COMPARA TODAS LAS LETRAS ANTES DE ADIVINAR",
            "EL MENSAJE PARECE EXTRAÑO PERO TODAVIA SIGUE UNA REGLA",
            "LAS LETRAS REPETIDAS PUEDEN AYUDAR A ENCONTRAR LA RESPUESTA",
            "LA MEJOR ESTRATEGIA EMPIEZA CON UNA OBSERVACION CUIDADOSA",
            "UNA SOLA PISTA PUEDE CAMBIAR LA FORMA DE VER TODO EL MENSAJE",
            "EL VIEJO MAPA TENIA UNA MARCA JUNTO AL PUENTE",
            "LA CARTA LLEGO SIN NOMBRE Y CON UNA FECHA EXTRAÑA",
            "EL EQUIPO REVISA CADA LETRA ANTES DE PROPONER UNA CLAVE",
            "UNA PALABRA REPETIDA PUEDE MOSTRAR DONDE EMPIEZA EL PATRON",
            "CUANDO UNA IDEA FALLA CONVIENE PROBAR UNA REGLA DIFERENTE",
            "LOS ESPACIOS ENTRE PALABRAS OFRECEN INFORMACION MUY UTIL",
            "UNA FRECUENCIA ALTA PUEDE SUGERIR UNA LETRA COMUN DEL IDIOMA",
            "EL PRIMER PASO ES SEPARAR LOS HECHOS DE LAS SUPOSICIONES",
            "CADA NUEVA LETRA CONFIRMADA DEBE FUNCIONAR EN TODO EL TEXTO",
            "LA FRASE OCULTA SE VUELVE MAS CLARA DESPUES DE VARIAS PRUEBAS",
            "EL PATRON DE UNA PALABRA PUEDE SER MAS UTIL QUE SU LONGITUD",
            "UNA BUENA PISTA REDUCE LAS OPCIONES SIN REGALAR LA RESPUESTA",
            "EL MENSAJE SE ENTIENDE MEJOR CUANDO COMPARAS VARIOS PATRONES",
            "LAS PALABRAS CORTAS SON UN BUEN LUGAR PARA EMPEZAR EL ANALISIS",
            "EL CUADERNO TENIA UNA NOTA ESCONDIDA ENTRE DOS PAGINAS",
            "LA PUERTA ANTIGUA TENIA CINCO SIMBOLOS GRABADOS EN LA MADERA",
            "EL RELOJ SE DETUVO JUSTO CUANDO LLEGO EL MENSAJE SECRETO",
            "UNA LUZ EN LA VENTANA MARCABA EL INICIO DE LA SEÑAL",
            "EL EQUIPO ENCONTRO OTRA PISTA DEBAJO DE LA MESA",
            "LA RESPUESTA APARECIO CUANDO ORDENARON LAS LETRAS CON CUIDADO",
            "EL ARCHIVO CONTENIA VARIAS CLAVES PERO SOLO UNA ERA CORRECTA",
            "LA SECUENCIA CAMBIA DE FORMA REGULAR DESPUES DE CADA LETRA",
            "COMPARAR DOS HIPOTESIS PUEDE REVELAR CUAL EXPLICA MAS DATOS",
            "EL MENSAJE OCULTO CONSERVA PATRONES AUNQUE CAMBIEN LAS LETRAS",
            "UNA TABLA BIEN ORGANIZADA PUEDE EVITAR MUCHOS ERRORES",
            "LA CLAVE CORRECTA PRODUCE PALABRAS NATURALES EN TODO EL TEXTO",
            "EL GRUPO DIVIDIO EL PROBLEMA EN PASOS MAS PEQUEÑOS",
            "UNA SEGUNDA REVISION DESCUBRIO EL ERROR EN LA PRIMERA FILA",
            "EL PATRON REPETIDO APARECIA TRES VECES EN EL MISMO MENSAJE",
            "LA NOTA DECIA QUE LA RESPUESTA ESTABA CERCA DEL FINAL",
            "EL EQUIPO PROBO LA CLAVE EN VARIAS PARTES ANTES DE ACEPTARLA",
            "UNA LETRA AISLADA PUEDE CAMBIAR TODA LA INTERPRETACION",
            "EL METODO MAS RAPIDO EMPIEZA CON LAS PISTAS MAS SEGURAS",
            "LAS RELACIONES ENTRE LETRAS SON TAN IMPORTANTES COMO LAS FRECUENCIAS"
        ],

        Hard: [
            "CUANDO UN MENSAJE PARECE ALEATORIO CONVIENE BUSCAR LA REGLA QUE PODRIA HABERLO PRODUCIDO",
            "UNA EXPLICACION FUERTE DEBE FUNCIONAR CON TODO EL MENSAJE Y NO SOLO CON UNA PARTE PEQUEÑA",
            "SI EL PRIMER METODO FALLA TODAVIA PUEDE MOSTRAR QUE POSIBILIDADES DEBES ELIMINAR",
            "LA ESTRUCTURA DEL IDIOMA DEJA PISTAS AUN CUANDO LAS LETRAS HAN CAMBIADO POR COMPLETO",
            "CUANDO DOS IDEAS PARECEN POSIBLES PRUEBA CUAL EXPLICA MEJOR TODOS LOS DETALLES DEL TEXTO",
            "EL CUADERNO ANTIGUO CONTENIA VARIAS FECHAS QUE PARECIAN NO TENER RELACION ENTRE SI",
            "UNA HIPOTESIS UTIL DEBE PREDECIR LETRAS NUEVAS Y NO LIMITARSE A EXPLICAR LAS QUE YA CONOCES",
            "LOS PATRONES REPETIDOS PUEDEN REVELAR LA ESTRUCTURA DEL MENSAJE INCLUSO SIN ESPACIOS",
            "UNA SOLUCION CONVINCENTE DEBE MANTENERSE CUANDO LA PRUEBAS EN LAS PARTES MAS DIFICILES",
            "EL EQUIPO DESCARTO VARIAS CLAVES PORQUE PRODUCIAN CONTRADICCIONES EN OTRAS PALABRAS",
            "CUANTO MAS COMPLEJO PARECE EL CIFRADO MAS IMPORTANTE ES REGISTRAR CADA DEDUCCION CON ORDEN",
            "UNA PISTA BIEN ELEGIDA PUEDE CONECTAR DOS PARTES DEL PROBLEMA QUE PARECIAN INDEPENDIENTES",
            "EL ANALISIS MEJORA CUANDO DISTINGUES ENTRE UNA COINCIDENCIA POSIBLE Y UN PATRON QUE SE REPITE",
            "LAS FRECUENCIAS SON UN PUNTO DE PARTIDA PERO LOS PATRONES DE PALABRAS CONFIRMAN LAS HIPOTESIS",
            "CUANDO CAMBIA UNA SUPOSICION CONVIENE REVISAR TODAS LAS CONCLUSIONES QUE DEPENDIAN DE ELLA",
            "EL MENSAJE TENIA SUFICIENTES REGULARIDADES PARA DESCARTAR LA IDEA DE QUE FUERA PURO AZAR",
            "UNA BUENA ESTRATEGIA PRIORIZA LAS DEDUCCIONES QUE PUEDEN CONFIRMARSE EN MAS DE UN LUGAR",
            "EL DESCIFRADOR ANOTO CADA SUSTITUCION PARA EVITAR REPETIR EL MISMO TRABAJO EN OTRA LINEA",
            "A VECES UNA PALABRA COMUN RESULTA MAS UTIL QUE UNA LETRA FRECUENTE PORQUE REVELA VARIAS RELACIONES",
            "EL EQUIPO ENCONTRO LA CLAVE DESPUES DE COMPARAR LOS BLOQUES QUE APARECIAN CON MAYOR FRECUENCIA",
            "UNA CONTRADICCION TEMPRANA ES VALIOSA PORQUE PERMITE ABANDONAR UNA HIPOTESIS ANTES DE PERDER TIEMPO",
            "LA PARTE MAS DIFICIL NO ERA HACER LOS CALCULOS SINO DECIDIR QUE INFORMACION USAR PRIMERO",
            "EL TEXTO OCULTO CONSERVABA SU GRAMATICA Y ESO PERMITIO RECONSTRUIR VARIAS PALABRAS INCOMPLETAS",
            "CUANDO EL TIEMPO ES LIMITADO CONVIENE RESOLVER PRIMERO LOS PASOS QUE REDUCEN MAS POSIBILIDADES",
            "UNA TABLA ORDENADA DE RELACIONES PUEDE CONVERTIR UN PROBLEMA CONFUSO EN UNA SERIE DE PASOS CLAROS",
            "EL EQUIPO REVISO EL RESULTADO COMPLETO PARA ASEGURARSE DE QUE NINGUNA LETRA CONTRADECIA LA CLAVE",
            "LAS MEJORES DEDUCCIONES SON LAS QUE EXPLICAN VARIOS DETALLES DEL CIFRADO AL MISMO TIEMPO",
            "UN PATRON PEQUEÑO PUEDE PARECER CASUAL HASTA QUE APARECE DE NUEVO EN OTRA PARTE DEL MENSAJE",
            "EL ANALISIS CUIDADOSO DE LOS ERRORES PUEDE SER TAN UTIL COMO ENCONTRAR UNA LETRA CORRECTA",
            "UNA VEZ QUE VARIAS PIEZAS COINCIDEN EL RESTO DEL MENSAJE SUELE REVELARSE MUCHO MAS RAPIDO"
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

    function getCipherLengthProfile(
        difficulty,
        cipherType
    ) {

        const normalized = normalizeDifficulty(difficulty);
        const type = String(cipherType || "").toLowerCase();

        if (normalized === "Easy") {
            return { min: 9, max: 34, sourceDifficulties: ["Easy"] };
        }

        if (normalized === "Medium") {
            return { min: 28, max: 68, sourceDifficulties: ["Medium"] };
        }

        /*
        In advanced Codebusters ciphers, the cryptanalytic operation
        itself supplies most of the difficulty. Extremely long quotes
        make Hill/Nihilist/Porta/Fractionated-Morse style questions
        tedious rather than better. Prefer compact contest-sized text.
        */
        const compactHard = new Set([
            "affine",
            "railfence",
            "hill",
            "xenocrypt-cryptanalysis",
            "fractionatedmorse-cryptanalysis",
            "porta-cryptanalysis",
            "nihilist-cryptanalysis",
            "columnar-cryptanalysis",
            "checkerboard-cryptanalysis",
            "homophonic-cryptanalysis"
        ]);

        if (compactHard.has(type)) {
            return { min: 35, max: 72, sourceDifficulties: ["Medium", "Hard"] };
        }

        return { min: 55, max: 155, sourceDifficulties: ["Hard"] };
    }


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

                const profile =
                    getCipherLengthProfile(
                        normalized,
                        type
                    );


                if (
                    !profile.sourceDifficulties
                        .includes(
                            phrase.difficulty
                        )
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
                    length >= profile.min
                    &&
                    length <= profile.max
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

        const pool =
            SPANISH_PHRASES[normalized]
            ||
            SPANISH_PHRASES.Medium;

        let choices = pool.filter(
            phrase => !usedSpanishPhrases.has(`${normalized}:${phrase}`)
        );

        if (choices.length === 0) {
            for (const key of [...usedSpanishPhrases]) {
                if (key.startsWith(`${normalized}:`)) usedSpanishPhrases.delete(key);
            }
            choices = pool;
        }

        const selected = randomItem(choices);
        usedSpanishPhrases.add(`${normalized}:${selected}`);
        return selected;
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

        const profile =
            getCipherLengthProfile(
                normalized,
                type
            );


        eligible =
            phraseBank.filter(
                phrase => {

                    if (
                        !profile.sourceDifficulties
                            .includes(
                                phrase.difficulty
                            )
                    ) {
                        return false;
                    }


                    const length =
                        getLetterCount(
                            phrase.text
                        );


                    return (
                        length >= profile.min
                        &&
                        length <= profile.max
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


        const basePuzzle = {

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

            metadata: {

                generatorVersion:
                    "4.2",

                contextProfile:
                    "scioly-public-guidance-2026-expanded",

                generatedAt:
                    new Date()
                        .toISOString()

            }

        };


        const startingInfo =
            window.ProblemInfoEngine
                ?
                ProblemInfoEngine
                    .createStartingInfo({
                        ...basePuzzle,
                        type
                    })
                :
                {
                    title: "STARTING INFORMATION",
                    rows: generated.challengeInfo || []
                };


        const hints =
            window.ProblemInfoEngine
                ?
                ProblemInfoEngine
                    .createHints({
                        ...basePuzzle,
                        type
                    })
                :
                generated.hints;


        return {
            ...basePuzzle,
            problem_mode:
                window.ProblemInfoEngine
                    ? ProblemInfoEngine.getProblemMode(type)
                    : "decode",
            startingInfo,
            hints,

            /*
            Legacy alias retained for older UI/admin code.
            New Daily/Practice render startingInfo directly.
            */
            challengeInfo:
                startingInfo?.rows
                ||
                generated.challengeInfo
                ||
                []
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

                const randomizedHomophonic =
                    [
                        "homophonic",
                        "homophonic-cryptanalysis"
                    ]
                    .includes(
                        puzzle.cipher_id
                    );


                if (
                    randomizedHomophonic
                ) {

                    const mapping =
                        puzzle.parameters.mapping
                        ||
                        {};

                    const plaintextLetters =
                        String(
                            puzzle.solution
                            ||
                            ""
                        )
                        .toUpperCase()
                        .replace(
                            /J/g,
                            "I"
                        )
                        .replace(
                            /[^A-Z]/g,
                            ""
                        );

                    const cipherTokens =
                        String(
                            puzzle.ciphertext
                            ||
                            ""
                        )
                        .match(
                            /\d+/g
                        )
                        ||
                        [];

                    if (
                        cipherTokens.length
                        !==
                        plaintextLetters.length
                    ) {

                        errors.push(
                            "Homophonic ciphertext token count does not match plaintext length."
                        );

                    } else {

                        for (
                            let index = 0;
                            index < plaintextLetters.length;
                            index++
                        ) {

                            const letter =
                                plaintextLetters[index];

                            const allowed =
                                Array.isArray(
                                    mapping[letter]
                                )
                                    ?
                                    mapping[letter]
                                        .map(
                                            String
                                        )
                                    :
                                    [];

                            if (
                                !allowed.includes(
                                    cipherTokens[index]
                                )
                            ) {

                                errors.push(
                                    `Homophonic token ${cipherTokens[index]} is invalid for plaintext letter ${letter} at position ${index + 1}.`
                                );

                                break;
                            }
                        }
                    }

                } else {

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
        usedSpanishPhrases.clear();
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
        getCipherLengthProfile,

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