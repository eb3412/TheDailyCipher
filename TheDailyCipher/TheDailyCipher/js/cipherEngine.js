/*
=========================================================
THE DAILY CIPHER
Cipher Engine v2.0

Supported:
- Caesar
- Atbash
- Affine
- Rail Fence
- Baconian
- Aristocrat / Simple Substitution
- Patristocrat
- Porta
- Complete Columnar Transposition
- Nihilist
- Hill (2x2 and 3x3)
- Fractionated Morse
=========================================================
*/

const CipherEngine = (() => {

    const ALPHABET =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const POLYBIUS_ALPHABET =
        "ABCDEFGHIKLMNOPQRSTUVWXYZ";


    /*
    =====================================================
    GENERAL UTILITIES
    =====================================================
    */

    function cleanText(text) {

        return String(
            text || ""
        )
        .toUpperCase()
        .replace(/\s+/g, " ")
        .trim();
    }


    function lettersOnly(text) {

        return cleanText(text)
            .replace(
                /[^A-Z]/g,
                ""
            );
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
        + min;
    }


    function randomItem(array) {

        return array[
            Math.floor(
                Math.random()
                *
                array.length
            )
        ];
    }


    function shuffle(array) {

        const copy =
            [...array];


        for (
            let i =
                copy.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random()
                    *
                    (i + 1)
                );


            [
                copy[i],
                copy[j]
            ] =
            [
                copy[j],
                copy[i]
            ];
        }


        return copy;
    }


    function gcd(a, b) {

        a =
            Math.abs(a);

        b =
            Math.abs(b);


        while (
            b !== 0
        ) {

            const temp =
                b;

            b =
                a % b;

            a =
                temp;
        }


        return a;
    }


    function mod(
        value,
        modulus
    ) {

        return (
            (
                value % modulus
            )
            +
            modulus
        )
        %
        modulus;
    }


    function groupString(
        text,
        size = 5
    ) {

        const groups = [];


        for (
            let i = 0;
            i < text.length;
            i += size
        ) {

            groups.push(
                text.slice(
                    i,
                    i + size
                )
            );
        }


        return groups.join(
            " "
        );
    }


    function uniqueKeywordAlphabet(
        keyword
    ) {

        const output = [];


        for (
            const character
            of
            (
                lettersOnly(keyword)
                +
                ALPHABET
            )
        ) {

            if (
                !output.includes(
                    character
                )
            ) {

                output.push(
                    character
                );
            }
        }


        return output.join("");
    }


    /*
    =====================================================
    CAESAR
    =====================================================
    */

    function caesarEncrypt(
        plaintext,
        shift
    ) {

        const normalizedShift =
            mod(
                Number(shift),
                26
            );


        return cleanText(
            plaintext
        )
        .split("")
        .map(
            character => {

                const index =
                    ALPHABET.indexOf(
                        character
                    );


                if (
                    index === -1
                ) {

                    return character;
                }


                return ALPHABET[
                    (
                        index
                        +
                        normalizedShift
                    )
                    %
                    26
                ];

            }
        )
        .join("");
    }


    function generateCaesarKey() {

        return {

            shift:
                randomInteger(
                    1,
                    25
                )

        };
    }


    /*
    =====================================================
    ATBASH
    =====================================================
    */

    function atbashEncrypt(
        plaintext
    ) {

        return cleanText(
            plaintext
        )
        .split("")
        .map(
            character => {

                const index =
                    ALPHABET.indexOf(
                        character
                    );


                if (
                    index === -1
                ) {

                    return character;
                }


                return ALPHABET[
                    25 - index
                ];

            }
        )
        .join("");
    }


    /*
    =====================================================
    AFFINE
    =====================================================
    */

    const VALID_AFFINE_A_VALUES =
        [
            1,
            3,
            5,
            7,
            9,
            11,
            15,
            17,
            19,
            21,
            23,
            25
        ];


    function affineEncrypt(
        plaintext,
        a,
        b
    ) {

        a =
            Number(a);

        b =
            Number(b);


        if (
            !VALID_AFFINE_A_VALUES
                .includes(a)
        ) {

            throw new Error(
                `Invalid Affine key: a=${a}`
            );
        }


        return cleanText(
            plaintext
        )
        .split("")
        .map(
            character => {

                const index =
                    ALPHABET.indexOf(
                        character
                    );


                if (
                    index === -1
                ) {

                    return character;
                }


                return ALPHABET[
                    mod(
                        (
                            a * index
                        )
                        +
                        b,
                        26
                    )
                ];

            }
        )
        .join("");
    }


    function generateAffineKey() {

        return {

            a:
                randomItem(
                    VALID_AFFINE_A_VALUES
                ),

            b:
                randomInteger(
                    0,
                    25
                )

        };
    }


    /*
    =====================================================
    RAIL FENCE
    =====================================================
    */

    function railFenceEncrypt(
        plaintext,
        rails
    ) {

        const text =
            cleanText(
                plaintext
            );


        rails =
            Number(
                rails
            );


        if (
            !Number.isInteger(
                rails
            )
            ||
            rails < 2
        ) {

            throw new Error(
                "Rail Fence requires at least 2 rails."
            );
        }


        if (
            rails >=
            text.length
        ) {

            return text;
        }


        const fence =
            Array.from(
                {
                    length:
                        rails
                },
                () => []
            );


        let currentRail =
            0;

        let direction =
            1;


        for (
            const character
            of text
        ) {

            fence[
                currentRail
            ].push(
                character
            );


            if (
                currentRail === 0
            ) {

                direction =
                    1;

            } else if (
                currentRail
                ===
                rails - 1
            ) {

                direction =
                    -1;
            }


            currentRail +=
                direction;
        }


        return fence
            .flat()
            .join("");
    }


    function generateRailFenceKey(
        difficulty = "Easy"
    ) {

        const ranges = {

            Easy:
                [2, 3],

            Medium:
                [3, 4],

            Hard:
                [4, 6]

        };


        const range =
            ranges[
                difficulty
            ]
            ||
            ranges.Easy;


        return {

            rails:
                randomInteger(
                    range[0],
                    range[1]
                )

        };
    }


    /*
    =====================================================
    BACONIAN
    =====================================================
    */

    function numberToBaconian(
        index
    ) {

        return index
            .toString(2)
            .padStart(
                5,
                "0"
            )
            .replace(
                /0/g,
                "A"
            )
            .replace(
                /1/g,
                "B"
            );
    }


    function baconianEncrypt(
        plaintext
    ) {

        return cleanText(
            plaintext
        )
        .split("")
        .map(
            character => {

                if (
                    character ===
                    " "
                ) {

                    return "/";
                }


                const index =
                    ALPHABET.indexOf(
                        character
                    );


                if (
                    index === -1
                ) {

                    return character;
                }


                return numberToBaconian(
                    index
                );

            }
        )
        .join(" ");
    }


    /*
    =====================================================
    SIMPLE SUBSTITUTION / ARISTOCRAT
    =====================================================
    */

    function generateSubstitutionAlphabet() {

        let generated;

        let attempts =
            0;


        do {

            generated =
                shuffle(
                    ALPHABET.split("")
                );


            attempts++;


            if (
                attempts >
                10000
            ) {

                throw new Error(
                    "Could not generate substitution alphabet."
                );
            }


        } while (

            generated.some(
                (
                    letter,
                    index
                ) =>
                    letter
                    ===
                    ALPHABET[index]
            )

        );


        return generated.join("");
    }


    function substitutionEncrypt(
        plaintext,
        cipherAlphabet
    ) {

        const alphabet =
            String(
                cipherAlphabet
            )
            .toUpperCase();


        if (
            alphabet.length
            !==
            26
            ||
            new Set(
                alphabet
            ).size
            !==
            26
        ) {

            throw new Error(
                "Substitution alphabet must contain 26 unique letters."
            );
        }


        return cleanText(
            plaintext
        )
        .split("")
        .map(
            character => {

                const index =
                    ALPHABET.indexOf(
                        character
                    );


                if (
                    index === -1
                ) {

                    return character;
                }


                return alphabet[
                    index
                ];

            }
        )
        .join("");
    }


    function generateSubstitutionKey() {

        return {

            alphabet:
                generateSubstitutionAlphabet()

        };
    }


    /*
    =====================================================
    PATRISTOCRAT
    =====================================================
    */

    function patristocratEncrypt(
        plaintext,
        cipherAlphabet
    ) {

        const encrypted =
            substitutionEncrypt(
                plaintext,
                cipherAlphabet
            )
            .replace(
                /[^A-Z]/g,
                ""
            );


        return groupString(
            encrypted,
            5
        );
    }


    function generatePatristocratKey() {

        return generateSubstitutionKey();
    }


    /*
    =====================================================
    PORTA
    =====================================================
    */

    const PORTA_KEYWORDS =
        [
            "CIPHER",
            "SECRET",
            "LOGIC",
            "MATRIX",
            "PUZZLE",
            "CODE",
            "ANALYSIS",
            "CRYPTO"
        ];


    function portaEncrypt(
        plaintext,
        keyword
    ) {

        const text =
            cleanText(
                plaintext
            );


        const key =
            lettersOnly(
                keyword
            );


        if (
            key.length === 0
        ) {

            throw new Error(
                "Porta requires a keyword."
            );
        }


        let result =
            "";

        let keyPosition =
            0;


        for (
            const character
            of text
        ) {

            const plaintextIndex =
                ALPHABET.indexOf(
                    character
                );


            if (
                plaintextIndex === -1
            ) {

                result +=
                    character;

                continue;
            }


            const keyLetter =
                key[
                    keyPosition
                    %
                    key.length
                ];


            const keyIndex =
                ALPHABET.indexOf(
                    keyLetter
                );


            const group =
                Math.floor(
                    keyIndex / 2
                );


            let encryptedIndex;


            if (
                plaintextIndex < 13
            ) {

                encryptedIndex =
                    13
                    +
                    (
                        (
                            plaintextIndex
                            +
                            group
                        )
                        %
                        13
                    );

            } else {

                encryptedIndex =
                    mod(
                        (
                            plaintextIndex
                            -
                            13
                            -
                            group
                        ),
                        13
                    );
            }


            result +=
                ALPHABET[
                    encryptedIndex
                ];


            keyPosition++;
        }


        return result;
    }


    function generatePortaKey() {

        return {

            keyword:
                randomItem(
                    PORTA_KEYWORDS
                )

        };
    }


    /*
    =====================================================
    COMPLETE COLUMNAR TRANSPOSITION
    =====================================================
    */

    function validateColumnarKey(
        key
    ) {

        if (
            !Array.isArray(
                key
            )
            ||
            key.length < 2
        ) {

            return false;
        }


        const expected =
            Array.from(
                {
                    length:
                        key.length
                },
                (
                    _,
                    index
                ) =>
                    index + 1
            );


        const sorted =
            [...key]
            .sort(
                (
                    a,
                    b
                ) =>
                    a - b
            );


        return (
            JSON.stringify(
                expected
            )
            ===
            JSON.stringify(
                sorted
            )
        );
    }


    function columnarEncrypt(
        plaintext,
        key
    ) {

        if (
            !validateColumnarKey(
                key
            )
        ) {

            throw new Error(
                "Invalid Columnar key."
            );
        }


        let text =
            lettersOnly(
                plaintext
            );


        const columns =
            key.length;


        while (
            text.length
            %
            columns
            !==
            0
        ) {

            text +=
                "X";
        }


        const rows =
            [];


        for (
            let i = 0;
            i < text.length;
            i += columns
        ) {

            rows.push(
                text.slice(
                    i,
                    i + columns
                )
            );
        }


        let ciphertext =
            "";


        for (
            let label = 1;
            label <= columns;
            label++
        ) {

            const column =
                key.indexOf(
                    label
                );


            for (
                const row
                of rows
            ) {

                ciphertext +=
                    row[column];
            }
        }


        return ciphertext;
    }


    function generateColumnarKey(
        difficulty = "Medium"
    ) {

        let columns;


        if (
            difficulty ===
            "Easy"
        ) {

            columns =
                randomInteger(
                    3,
                    4
                );

        } else if (
            difficulty ===
            "Medium"
        ) {

            columns =
                randomInteger(
                    4,
                    6
                );

        } else {

            columns =
                randomInteger(
                    5,
                    8
                );
        }


        const numbers =
            Array.from(
                {
                    length:
                        columns
                },
                (
                    _,
                    index
                ) =>
                    index + 1
            );


        return {

            key:
                shuffle(
                    numbers
                )

        };
    }


    /*
    =====================================================
    NIHILIST
    =====================================================
    */

    const NIHILIST_KEYWORDS =
        [
            "CIPHER",
            "SECRET",
            "PUZZLE",
            "LOGIC",
            "MATRIX",
            "CODE"
        ];


    function normalizePolybiusLetter(
        character
    ) {

        return character ===
            "J"
            ?
            "I"
            :
            character;
    }


    function buildPolybiusSquare(
        keyword
    ) {

        const output =
            [];


        const source =
            (
                lettersOnly(
                    keyword
                )
                +
                POLYBIUS_ALPHABET
            );


        for (
            let character
            of source
        ) {

            character =
                normalizePolybiusLetter(
                    character
                );


            if (
                POLYBIUS_ALPHABET
                    .includes(
                        character
                    )
                &&
                !output.includes(
                    character
                )
            ) {

                output.push(
                    character
                );
            }
        }


        const alphabet =
            output.join("");


        const map =
            {};


        for (
            let i = 0;
            i < alphabet.length;
            i++
        ) {

            const row =
                Math.floor(
                    i / 5
                )
                +
                1;


            const column =
                (
                    i % 5
                )
                +
                1;


            map[
                alphabet[i]
            ] =
                (
                    row * 10
                )
                +
                column;
        }


        map.J =
            map.I;


        return {

            alphabet,

            map

        };
    }


    function nihilistEncrypt(
        plaintext,
        squareKeyword,
        additiveKeyword
    ) {

        const square =
            buildPolybiusSquare(
                squareKeyword
            );


        const key =
            lettersOnly(
                additiveKeyword
            )
            .split("")
            .map(
                normalizePolybiusLetter
            )
            .join("");


        if (
            key.length === 0
        ) {

            throw new Error(
                "Nihilist requires an additive keyword."
            );
        }


        const text =
            lettersOnly(
                plaintext
            )
            .split("")
            .map(
                normalizePolybiusLetter
            );


        const numbers =
            text.map(
                (
                    character,
                    index
                ) => {

                    const plainValue =
                        square.map[
                            character
                        ];


                    const keyCharacter =
                        key[
                            index
                            %
                            key.length
                        ];


                    const keyValue =
                        square.map[
                            keyCharacter
                        ];


                    return (
                        plainValue
                        +
                        keyValue
                    );

                }
            );


        return numbers.join(
            " "
        );
    }


    function generateNihilistKey() {

        let squareKeyword =
            randomItem(
                NIHILIST_KEYWORDS
            );


        let additiveKeyword =
            randomItem(
                NIHILIST_KEYWORDS
            );


        if (
            additiveKeyword
            ===
            squareKeyword
        ) {

            additiveKeyword =
                randomItem(
                    NIHILIST_KEYWORDS.filter(
                        word =>
                            word
                            !==
                            squareKeyword
                    )
                );
        }


        return {

            squareKeyword,

            additiveKeyword

        };
    }


    /*
    =====================================================
    HILL CIPHER
    =====================================================
    */

    const HILL_2X2_KEYS =
        [
            [
                [3, 3],
                [2, 5]
            ],
            [
                [5, 8],
                [17, 3]
            ],
            [
                [7, 8],
                [11, 11]
            ]
        ];


    const HILL_3X3_KEYS =
        [
            [
                [6, 24, 1],
                [13, 16, 10],
                [20, 17, 15]
            ],
            [
                [17, 17, 5],
                [21, 18, 21],
                [2, 2, 19]
            ]
        ];


    function determinant(
        matrix
    ) {

        if (
            matrix.length === 2
        ) {

            return (
                matrix[0][0]
                *
                matrix[1][1]
            )
            -
            (
                matrix[0][1]
                *
                matrix[1][0]
            );
        }


        if (
            matrix.length === 3
        ) {

            const [
                a,
                b,
                c
            ] =
                matrix[0];


            const [
                d,
                e,
                f
            ] =
                matrix[1];


            const [
                g,
                h,
                i
            ] =
                matrix[2];


            return (
                a
                *
                (
                    e * i
                    -
                    f * h
                )
            )
            -
            (
                b
                *
                (
                    d * i
                    -
                    f * g
                )
            )
            +
            (
                c
                *
                (
                    d * h
                    -
                    e * g
                )
            );
        }


        throw new Error(
            "Hill currently supports only 2x2 or 3x3 matrices."
        );
    }


    function validateHillMatrix(
        matrix
    ) {

        if (
            !Array.isArray(
                matrix
            )
        ) {

            return false;
        }


        const size =
            matrix.length;


        if (
            ![
                2,
                3
            ].includes(
                size
            )
        ) {

            return false;
        }


        if (
            !matrix.every(
                row =>
                    Array.isArray(
                        row
                    )
                    &&
                    row.length
                    ===
                    size
                    &&
                    row.every(
                        Number.isFinite
                    )
            )
        ) {

            return false;
        }


        return (
            gcd(
                determinant(
                    matrix
                ),
                26
            )
            ===
            1
        );
    }


    function hillEncrypt(
        plaintext,
        matrix
    ) {

        if (
            !validateHillMatrix(
                matrix
            )
        ) {

            throw new Error(
                "Hill matrix must be an invertible 2x2 or 3x3 matrix modulo 26."
            );
        }


        let text =
            lettersOnly(
                plaintext
            );


        const size =
            matrix.length;


        while (
            text.length
            %
            size
            !==
            0
        ) {

            text +=
                "X";
        }


        let ciphertext =
            "";


        for (
            let position = 0;
            position < text.length;
            position += size
        ) {

            const vector =
                text
                .slice(
                    position,
                    position + size
                )
                .split("")
                .map(
                    letter =>
                        ALPHABET.indexOf(
                            letter
                        )
                );


            for (
                let row = 0;
                row < size;
                row++
            ) {

                let value =
                    0;


                for (
                    let column = 0;
                    column < size;
                    column++
                ) {

                    value +=
                        matrix[row][column]
                        *
                        vector[column];
                }


                ciphertext +=
                    ALPHABET[
                        mod(
                            value,
                            26
                        )
                    ];
            }
        }


        return ciphertext;
    }


    function generateHillKey(
        difficulty = "Medium"
    ) {

        let matrix;


        if (
            difficulty ===
            "Hard"
            &&
            Math.random() <
            0.4
        ) {

            matrix =
                randomItem(
                    HILL_3X3_KEYS
                );

        } else {

            matrix =
                randomItem(
                    HILL_2X2_KEYS
                );
        }


        return {

            matrix:
                matrix.map(
                    row =>
                        [...row]
                )

        };
    }


    /*
    =====================================================
    FRACTIONATED MORSE
    =====================================================
    */

    const MORSE =
        {

            A: ".-",
            B: "-...",
            C: "-.-.",
            D: "-..",
            E: ".",
            F: "..-.",
            G: "--.",
            H: "....",
            I: "..",
            J: ".---",
            K: "-.-",
            L: ".-..",
            M: "--",
            N: "-.",
            O: "---",
            P: ".--.",
            Q: "--.-",
            R: ".-.",
            S: "...",
            T: "-",
            U: "..-",
            V: "...-",
            W: ".--",
            X: "-..-",
            Y: "-.--",
            Z: "--.."

        };


    const FRACTIONATED_MORSE_TRIGRAMS =
        (() => {

            const symbols =
                [
                    ".",
                    "-",
                    "x"
                ];


            const output =
                [];


            for (
                const first
                of symbols
            ) {

                for (
                    const second
                    of symbols
                ) {

                    for (
                        const third
                        of symbols
                    ) {

                        const trigram =
                            first
                            +
                            second
                            +
                            third;


                        if (
                            trigram
                            !==
                            "xxx"
                        ) {

                            output.push(
                                trigram
                            );
                        }
                    }
                }
            }


            return output;

        })();


    const FRACTIONATED_KEYWORDS =
        [
            "CIPHER",
            "SECRET",
            "MORSE",
            "PUZZLE",
            "SIGNAL",
            "LOGIC",
            "CRYPTO"
        ];


    function plaintextToMorseStream(
        plaintext
    ) {

        const words =
            cleanText(
                plaintext
            )
            .match(
                /[A-Z]+/g
            )
            ||
            [];


        if (
            words.length === 0
        ) {

            throw new Error(
                "Fractionated Morse requires alphabetic plaintext."
            );
        }


        return words
            .map(
                word =>
                    word
                    .split("")
                    .map(
                        letter =>
                            MORSE[
                                letter
                            ]
                    )
                    .join(
                        "x"
                    )
            )
            .join(
                "xx"
            );
    }


    function fractionatedMorseEncrypt(
        plaintext,
        keyword
    ) {

        const cipherAlphabet =
            uniqueKeywordAlphabet(
                keyword
            );


        let stream =
            plaintextToMorseStream(
                plaintext
            );


        while (
            stream.length % 3
            !==
            0
        ) {

            stream +=
                "x";
        }


        let ciphertext =
            "";


        for (
            let i = 0;
            i < stream.length;
            i += 3
        ) {

            const trigram =
                stream.slice(
                    i,
                    i + 3
                );


            const index =
                FRACTIONATED_MORSE_TRIGRAMS
                    .indexOf(
                        trigram
                    );


            if (
                index === -1
            ) {

                throw new Error(
                    `Invalid Fractionated Morse trigram: ${trigram}`
                );
            }


            ciphertext +=
                cipherAlphabet[
                    index
                ];
        }


        return groupString(
            ciphertext,
            5
        );
    }


    function generateFractionatedMorseKey() {

        return {

            keyword:
                randomItem(
                    FRACTIONATED_KEYWORDS
                )

        };
    }


    /*
    =====================================================
    HINT SYSTEM
    =====================================================
    */

    function createHints(
        type,
        parameters = {}
    ) {

        switch (
            String(type)
                .toLowerCase()
        ) {

            case "caesar":

                return [

                    {
                        level: 1,
                        title:
                            "Cipher Family",
                        text:
                            "This is a monoalphabetic substitution cipher."
                    },

                    {
                        level: 2,
                        title:
                            "Pattern Hint",
                        text:
                            "Every letter moves the same distance through the alphabet."
                    },

                    {
                        level: 3,
                        title:
                            "Method Hint",
                        text:
                            "Try testing possible Caesar shifts."
                    },

                    {
                        level: 4,
                        title:
                            "Strong Hint",
                        text:
                            `The shift is ${parameters.shift}.`
                    }

                ];


            case "atbash":

                return [

                    {
                        level: 1,
                        title:
                            "Cipher Family",
                        text:
                            "This is a substitution cipher."
                    },

                    {
                        level: 2,
                        title:
                            "Pattern Hint",
                        text:
                            "The alphabet is paired from opposite ends."
                    },

                    {
                        level: 3,
                        title:
                            "Strong Hint",
                        text:
                            "A maps to Z, B maps to Y, and so on."
                    }

                ];


            case "affine":

                return [

                    {
                        level: 1,
                        title:
                            "Cipher Family",
                        text:
                            "This is a mathematical monoalphabetic substitution cipher."
                    },

                    {
                        level: 2,
                        title:
                            "Math Hint",
                        text:
                            "The transformation uses modular arithmetic."
                    },

                    {
                        level: 3,
                        title:
                            "Formula Hint",
                        text:
                            "Use E(x) = (ax + b) mod 26."
                    },

                    {
                        level: 4,
                        title:
                            "Strong Hint",
                        text:
                            `a=${parameters.a}, b=${parameters.b}.`
                    }

                ];


            case "railfence":

                return [

                    {
                        level: 1,
                        title:
                            "Cipher Family",
                        text:
                            "This is a transposition cipher."
                    },

                    {
                        level: 2,
                        title:
                            "Pattern Hint",
                        text:
                            "The letters themselves were not substituted."
                    },

                    {
                        level: 3,
                        title:
                            "Method Hint",
                        text:
                            "Try arranging the text in a repeating zigzag."
                    },

                    {
                        level: 4,
                        title:
                            "Strong Hint",
                        text:
                            `It uses ${parameters.rails} rails.`
                    }

                ];


            case "baconian":

                return [

                    {
                        level: 1,
                        title:
                            "Cipher Family",
                        text:
                            "The message represents letters using only two symbols."
                    },

                    {
                        level: 2,
                        title:
                            "Pattern Hint",
                        text:
                            "Look for groups of five."
                    },

                    {
                        level: 3,
                        title:
                            "Strong Hint",
                        text:
                            "Each plaintext letter is represented by a five-character A/B pattern."
                    }

                ];


            case "aristocrat":
            case "substitution":

                return [

                    {
                        level: 1,
                        title:
                            "Cipher Family",
                        text:
                            "This is a monoalphabetic substitution cipher."
                    },

                    {
                        level: 2,
                        title:
                            "Pattern Hint",
                        text:
                            "The same plaintext letter always maps to the same ciphertext letter."
                    },

                    {
                        level: 3,
                        title:
                            "Method Hint",
                        text:
                            "Use word patterns, repeated letters, and frequency analysis."
                    }

                ];


            case "patristocrat":

                return [

                    {
                        level: 1,
                        title:
                            "Cipher Family",
                        text:
                            "This is a monoalphabetic substitution cipher."
                    },

                    {
                        level: 2,
                        title:
                            "Formatting Hint",
                        text:
                            "The original word spacing has been removed."
                    },

                    {
                        level: 3,
                        title:
                            "Method Hint",
                        text:
                            "Use frequency analysis and repeated letter patterns."
                    }

                ];


            case "porta":

                return [

                    {
                        level: 1,
                        title:
                            "Cipher Family",
                        text:
                            "This is a reciprocal polyalphabetic cipher."
                    },

                    {
                        level: 2,
                        title:
                            "Key Hint",
                        text:
                            "A repeating keyword controls the substitutions."
                    },

                    {
                        level: 3,
                        title:
                            "Structure Hint",
                        text:
                            "Keyword letters operate in pairs such as A/B, C/D, and E/F."
                    },

                    {
                        level: 4,
                        title:
                            "Strong Hint",
                        text:
                            `The keyword is ${parameters.keyword}.`
                    }

                ];


            case "columnar":

                return [

                    {
                        level: 1,
                        title:
                            "Cipher Family",
                        text:
                            "This is a transposition cipher."
                    },

                    {
                        level: 2,
                        title:
                            "Structure Hint",
                        text:
                            "The message was written into rows and read by columns."
                    },

                    {
                        level: 3,
                        title:
                            "Method Hint",
                        text:
                            "Try reconstructing a rectangular grid."
                    },

                    {
                        level: 4,
                        title:
                            "Strong Hint",
                        text:
                            `The column key is ${parameters.key.join("-")}.`
                    }

                ];


            case "nihilist":

                return [

                    {
                        level: 1,
                        title:
                            "Cipher Family",
                        text:
                            "This cipher combines a keyed Polybius square with numerical addition."
                    },

                    {
                        level: 2,
                        title:
                            "Number Hint",
                        text:
                            "Each plaintext letter and repeating key letter first becomes a Polybius coordinate."
                    },

                    {
                        level: 3,
                        title:
                            "Method Hint",
                        text:
                            "The two Polybius values are added to form each ciphertext number."
                    },

                    {
                        level: 4,
                        title:
                            "Strong Hint",
                        text:
                            `Square keyword: ${parameters.squareKeyword}; additive keyword: ${parameters.additiveKeyword}.`
                    }

                ];


            case "hill":

                return [

                    {
                        level: 1,
                        title:
                            "Cipher Family",
                        text:
                            "This is a matrix-based polygraphic substitution cipher."
                    },

                    {
                        level: 2,
                        title:
                            "Math Hint",
                        text:
                            "Convert letters to numbers and process them in blocks."
                    },

                    {
                        level: 3,
                        title:
                            "Method Hint",
                        text:
                            "Multiply each plaintext vector by the key matrix and reduce modulo 26."
                    },

                    {
                        level: 4,
                        title:
                            "Strong Hint",
                        text:
                            `The key matrix is ${JSON.stringify(parameters.matrix)}.`
                    }

                ];


            case "fractionatedmorse":

                return [

                    {
                        level: 1,
                        title:
                            "Cipher Family",
                        text:
                            "This cipher combines Morse code with a keyed substitution alphabet."
                    },

                    {
                        level: 2,
                        title:
                            "Morse Hint",
                        text:
                            "Dots and dashes are joined using x as separators."
                    },

                    {
                        level: 3,
                        title:
                            "Method Hint",
                        text:
                            "The Morse stream is divided into groups of three symbols."
                    },

                    {
                        level: 4,
                        title:
                            "Strong Hint",
                        text:
                            `The keyed alphabet begins with the keyword ${parameters.keyword}.`
                    }

                ];


            default:

                return [];
        }
    }


    /*
    =====================================================
    GENERIC ENCRYPT
    =====================================================
    */

    function encrypt(
        type,
        plaintext,
        parameters = {}
    ) {

        type =
            String(type)
                .toLowerCase();

const validation =
    validateParameters(
        type,
        parameters
    );


if (
    !validation.valid
) {

    throw new Error(
        validation.message
    );
}
        switch (type) {

            case "caesar":

                return caesarEncrypt(
                    plaintext,
                    parameters.shift
                );


            case "atbash":

                return atbashEncrypt(
                    plaintext
                );


            case "affine":

                return affineEncrypt(
                    plaintext,
                    parameters.a,
                    parameters.b
                );


            case "railfence":

                return railFenceEncrypt(
                    plaintext,
                    parameters.rails
                );


            case "baconian":

                return baconianEncrypt(
                    plaintext
                );


            case "aristocrat":
            case "substitution":

                return substitutionEncrypt(
                    plaintext,
                    parameters.alphabet
                );


            case "patristocrat":

                return patristocratEncrypt(
                    plaintext,
                    parameters.alphabet
                );


            case "porta":

                return portaEncrypt(
                    plaintext,
                    parameters.keyword
                );


            case "columnar":

                return columnarEncrypt(
                    plaintext,
                    parameters.key
                );


            case "nihilist":

                return nihilistEncrypt(
                    plaintext,
                    parameters.squareKeyword,
                    parameters.additiveKeyword
                );


            case "hill":

                return hillEncrypt(
                    plaintext,
                    parameters.matrix
                );


            case "fractionatedmorse":

                return fractionatedMorseEncrypt(
                    plaintext,
                    parameters.keyword
                );


            default:

                throw new Error(
                    `Unsupported cipher type: ${type}`
                );
        }
    }


    /*
    =====================================================
    RANDOM KEYS
    =====================================================
    */

    function generateKey(
        type,
        difficulty = "Easy"
    ) {

        type =
            String(type)
                .toLowerCase();


        switch (type) {

            case "caesar":

                return generateCaesarKey();


            case "atbash":

                return {};


            case "affine":

                return generateAffineKey();


            case "railfence":

                return generateRailFenceKey(
                    difficulty
                );


            case "baconian":

                return {};


            case "aristocrat":
            case "substitution":

                return generateSubstitutionKey();


            case "patristocrat":

                return generatePatristocratKey();


            case "porta":

                return generatePortaKey();


            case "columnar":

                return generateColumnarKey(
                    difficulty
                );


            case "nihilist":

                return generateNihilistKey();


            case "hill":

                return generateHillKey(
                    difficulty
                );


            case "fractionatedmorse":

                return generateFractionatedMorseKey();


            default:

                throw new Error(
                    `Cannot generate key for ${type}.`
                );
        }
    }


    /*
    =====================================================
    PUZZLE GENERATION
    =====================================================
    */

    function generate(
        options
    ) {

        if (
            !options
            ||
            typeof options
            !==
            "object"
        ) {

            throw new Error(
                "CipherEngine.generate requires options."
            );
        }


        const type =
            String(
                options.type || ""
            )
            .toLowerCase();


        const plaintext =
            cleanText(
                options.plaintext
            );


        const difficulty =
            options.difficulty
            ||
            "Easy";


        if (!type) {

            throw new Error(
                "Cipher type is required."
            );
        }


        if (!plaintext) {

            throw new Error(
                "Plaintext is required."
            );
        }


        const parameters =
            options.parameters
            ||
            generateKey(
                type,
                difficulty
            );


        return {

            type,

            difficulty,

            plaintext,

            ciphertext:
                encrypt(
                    type,
                    plaintext,
                    parameters
                ),

            parameters,

            hints:
                createHints(
                    type,
                    parameters
                ),

            generatedAt:
                new Date()
                    .toISOString()

        };
    }


    function createDailyPuzzle({
        id,
        date,
        difficulty,
        type,
        plaintext,
        parameters
    }) {

        const generated =
            generate({

                type,

                plaintext,

                difficulty,

                parameters

            });


        return {

            id,

            date,

            difficulty,

            cipher_type:
                getDisplayName(
                    type
                ),

            cipher_id:
                type,

            ciphertext:
                generated.ciphertext,

            solution:
                generated.plaintext,

            parameters:
                generated.parameters,

            hints:
                generated.hints

        };
    }


    /*
    =====================================================
    DISPLAY DATA
    =====================================================
    */

    function getDisplayName(
        type
    ) {

        const names = {

            caesar:
                "Caesar Cipher",

            atbash:
                "Atbash Cipher",

            affine:
                "Affine Cipher",

            railfence:
                "Rail Fence Cipher",

            baconian:
                "Baconian Cipher",

            aristocrat:
                "Aristocrat Cipher",

            substitution:
                "Simple Substitution Cipher",

            patristocrat:
                "Patristocrat Cipher",

            porta:
                "Porta Cipher",

            columnar:
                "Complete Columnar Transposition",

            nihilist:
                "Nihilist Cipher",

            hill:
                "Hill Cipher",

            fractionatedmorse:
                "Fractionated Morse Cipher"

        };


        return names[
            String(type)
                .toLowerCase()
        ]
        ||
        type;
    }


    function getSupportedCiphers() {

        return [

            {
                id:
                    "caesar",
                name:
                    "Caesar Cipher",
                category:
                    "Substitution"
            },

            {
                id:
                    "atbash",
                name:
                    "Atbash Cipher",
                category:
                    "Substitution"
            },

            {
                id:
                    "affine",
                name:
                    "Affine Cipher",
                category:
                    "Substitution"
            },

            {
                id:
                    "railfence",
                name:
                    "Rail Fence Cipher",
                category:
                    "Transposition"
            },

            {
                id:
                    "baconian",
                name:
                    "Baconian Cipher",
                category:
                    "Encoding"
            },

            {
                id:
                    "aristocrat",
                name:
                    "Aristocrat Cipher",
                category:
                    "Substitution"
            },

            {
                id:
                    "patristocrat",
                name:
                    "Patristocrat Cipher",
                category:
                    "Substitution"
            },

            {
                id:
                    "porta",
                name:
                    "Porta Cipher",
                category:
                    "Polyalphabetic"
            },

            {
                id:
                    "columnar",
                name:
                    "Complete Columnar Transposition",
                category:
                    "Transposition"
            },

            {
                id:
                    "nihilist",
                name:
                    "Nihilist Cipher",
                category:
                    "Polybius / Additive"
            },

            {
                id:
                    "hill",
                name:
                    "Hill Cipher",
                category:
                    "Matrix"
            },

            {
                id:
                    "fractionatedmorse",
                name:
                    "Fractionated Morse Cipher",
                category:
                    "Morse / Fractionation"
            }

        ];
    }


    /*
    =====================================================
    SELF TEST
    =====================================================
    */

    function selfTest() {

        console.group(
            "The Daily Cipher — Cipher Engine v2 Test"
        );


        let passed =
            0;

        let failed =
            0;


        function test(
            name,
            actual,
            expected
        ) {

            if (
                actual ===
                expected
            ) {

                console.log(
                    `✅ ${name}`
                );

                passed++;

            } else {

                console.error(
                    `❌ ${name}`
                );

                console.error(
                    "Expected:",
                    expected
                );

                console.error(
                    "Actual:",
                    actual
                );

                failed++;
            }
        }


        test(
            "Caesar +3",
            caesarEncrypt(
                "HELLO WORLD",
                3
            ),
            "KHOOR ZRUOG"
        );


        test(
            "Caesar wraparound",
            caesarEncrypt(
                "XYZ",
                3
            ),
            "ABC"
        );


        test(
            "Atbash",
            atbashEncrypt(
                "HELLO WORLD"
            ),
            "SVOOL DLIOW"
        );


        test(
            "Affine",
            affineEncrypt(
                "AFFINE CIPHER",
                5,
                8
            ),
            "IHHWVC SWFRCP"
        );


        test(
            "Rail Fence",
            railFenceEncrypt(
                "WEAREDISCOVEREDFLEEATONCE",
                3
            ),
            "WECRLTEERDSOEEFEAOCAIVDEN"
        );


        test(
            "Baconian",
            baconianEncrypt(
                "ABC"
            ),
            "AAAAA AAAAB AAABA"
        );


        test(
            "Substitution",
            substitutionEncrypt(
                "ABC",
                "BCDEFGHIJKLMNOPQRSTUVWXYZA"
            ),
            "BCD"
        );


        const generated =
            generate({

                type:
                    "caesar",

                plaintext:
                    "THE DAILY CIPHER",

                difficulty:
                    "Easy",

                parameters: {
                    shift:
                        7
                }

            });


        test(
            "Generated Caesar",
            generated.ciphertext,
            "AOL KHPSF JPWOLY"
        );


        test(
            "Patristocrat",
            patristocratEncrypt(
                "HELLO WORLD",
                "BCDEFGHIJKLMNOPQRSTUVWXYZA"
            ),
            "IFMMP XPSME"
        );


        const portaTest =
            portaEncrypt(
                "HELLO WORLD",
                "SECRET"
            );


        test(
            "Porta reciprocity",
            portaEncrypt(
                portaTest,
                "SECRET"
            ),
            "HELLO WORLD"
        );


        test(
            "Columnar",
            columnarEncrypt(
                "ATTACKATDAWN",
                [3, 1, 4, 2]
            ),
            "TKAATNACDTAW"
        );


        test(
            "Nihilist",
            nihilistEncrypt(
                "HELLO",
                "CIPHER",
                "SECRET"
            ),
            "57 30 44 54 56"
        );


        test(
            "Hill 2x2",
            hillEncrypt(
                "HELP",
                [
                    [3, 3],
                    [2, 5]
                ]
            ),
            "HIAT"
        );


        test(
            "Fractionated Morse",
            fractionatedMorseEncrypt(
                "HELLO WORLD",
                "CIPHER"
            ),
            "CATPH BMTOM HTPF"
        );


        console.log("");


        console.log(
            `Tests passed: ${passed}`
        );


        console.log(
            `Tests failed: ${failed}`
        );


        if (
            failed === 0
        ) {

            console.log(
                "🎉 Cipher Engine v2 is working correctly."
            );
        }


        console.groupEnd();


        return {

            passed,

            failed

        };
    }

/*
=========================================================
CIPHER KEY / PARAMETER VALIDATION
=========================================================
*/


function gcd(
    a,
    b
) {

    a =
        Math.abs(
            Number(a)
        );


    b =
        Math.abs(
            Number(b)
        );


    while (
        b !== 0
    ) {

        const temp =
            b;


        b =
            a % b;


        a =
            temp;
    }


    return a;
}


/*
=========================================================
SUBSTITUTION ALPHABET
=========================================================
*/

function isValidSubstitutionAlphabet(
    alphabet
) {

    if (
        typeof alphabet !==
        "string"
    ) {

        return false;
    }


    const cleaned =
        alphabet
            .toUpperCase()
            .replace(
                /[^A-Z]/g,
                ""
            );


    return (

        cleaned.length === 26

        &&

        new Set(
            cleaned
        ).size === 26

    );
}


/*
=========================================================
AFFINE
=========================================================
*/

function isValidAffineKey(
    a,
    b
) {

    const multiplier =
        Number(a);


    const shift =
        Number(b);


    return (

        Number.isInteger(
            multiplier
        )

        &&

        Number.isInteger(
            shift
        )

        &&

        gcd(
            multiplier,
            26
        ) === 1

    );
}


/*
=========================================================
HILL
=========================================================
*/

function determinant2x2(
    matrix
) {

    return (

        matrix[0][0]
        *
        matrix[1][1]

        -

        matrix[0][1]
        *
        matrix[1][0]

    );
}


function determinant3x3(
    matrix
) {

    const a =
        matrix[0][0];


    const b =
        matrix[0][1];


    const c =
        matrix[0][2];


    const d =
        matrix[1][0];


    const e =
        matrix[1][1];


    const f =
        matrix[1][2];


    const g =
        matrix[2][0];


    const h =
        matrix[2][1];


    const i =
        matrix[2][2];


    return (

        a * (
            e * i
            -
            f * h
        )

        -

        b * (
            d * i
            -
            f * g
        )

        +

        c * (
            d * h
            -
            e * g
        )

    );
}


function isValidHillMatrix(
    matrix
) {

    if (
        !Array.isArray(
            matrix
        )
    ) {

        return false;
    }


    const size =
        matrix.length;


    if (
        ![
            2,
            3
        ].includes(
            size
        )
    ) {

        return false;
    }


    const validRows =
        matrix.every(
            row =>

                Array.isArray(
                    row
                )

                &&

                row.length ===
                size

                &&

                row.every(
                    Number.isFinite
                )
        );


    if (
        !validRows
    ) {

        return false;
    }


    const determinant =
        size === 2

            ?

            determinant2x2(
                matrix
            )

            :

            determinant3x3(
                matrix
            );


    /*
    Matrix is invertible modulo 26 only if
    determinant and 26 are coprime.
    */

    return gcd(
        determinant,
        26
    ) === 1;
}


/*
=========================================================
COLUMNAR
=========================================================
*/

function isValidColumnarKey(
    key
) {

    if (
        !Array.isArray(
            key
        )

        ||

        key.length < 2
    ) {

        return false;
    }


    if (
        key.some(
            value =>
                !Number.isInteger(
                    Number(value)
                )
        )
    ) {

        return false;
    }


    const numbers =
        key.map(
            Number
        );


    const sorted =
        [
            ...numbers
        ]
        .sort(
            (
                a,
                b
            ) =>
                a - b
        );


    const expected =
        Array.from(
            {
                length:
                    numbers.length
            },

            (
                _,
                index
            ) =>
                index + 1
        );


    return expected.every(
        (
            value,
            index
        ) =>
            sorted[index]
            ===
            value
    );
}


/*
=========================================================
KEYWORD
=========================================================
*/

function isValidKeyword(
    keyword
) {

    return (

        typeof keyword ===
        "string"

        &&

        /^[A-Z]+$/i.test(
            keyword.trim()
        )

    );
}


/*
=========================================================
RAIL FENCE
=========================================================
*/

function isValidRailCount(
    rails
) {

    return (

        Number.isInteger(
            Number(
                rails
            )
        )

        &&

        Number(
            rails
        ) >= 2

    );
}


/*
=========================================================
CAESAR
=========================================================
*/

function isValidCaesarShift(
    shift
) {

    return Number.isInteger(
        Number(
            shift
        )
    );
}


/*
=========================================================
MASTER VALIDATOR
=========================================================
*/

function validateParameters(
    type,
    parameters = {}
) {

    const cipher =
        String(
            type
            ||
            ""
        )
        .toLowerCase();


    switch (
        cipher
    ) {


        /*
        -------------------------
        NO-KEY CIPHERS
        -------------------------
        */

        case "atbash":

        case "baconian":

            return {

                valid:
                    true,

                message:
                    ""

            };


        /*
        -------------------------
        CAESAR
        -------------------------
        */

        case "caesar":

            if (
                !isValidCaesarShift(
                    parameters.shift
                )
            ) {

                return {

                    valid:
                        false,

                    message:
                        "Caesar shift must be a whole number."

                };
            }


            return {

                valid:
                    true,

                message:
                    ""

            };


        /*
        -------------------------
        AFFINE
        -------------------------
        */

        case "affine":

            if (
                !isValidAffineKey(
                    parameters.a,
                    parameters.b
                )
            ) {

                return {

                    valid:
                        false,

                    message:
                        "Affine multiplier a must be coprime to 26, and both a and b must be whole numbers."

                };
            }


            return {

                valid:
                    true,

                message:
                    ""

            };


        /*
        -------------------------
        RAIL FENCE
        -------------------------
        */

        case "railfence":

            if (
                !isValidRailCount(
                    parameters.rails
                )
            ) {

                return {

                    valid:
                        false,

                    message:
                        "Rail Fence must use at least 2 rails."

                };
            }


            return {

                valid:
                    true,

                message:
                    ""

            };


        /*
        -------------------------
        ARISTOCRAT / PATRISTOCRAT
        -------------------------
        */

        case "aristocrat":

        case "patristocrat":

            if (
                !isValidSubstitutionAlphabet(
                    parameters.alphabet
                )
            ) {

                return {

                    valid:
                        false,

                    message:
                        "Substitution alphabet must contain every letter A-Z exactly once."

                };
            }


            return {

                valid:
                    true,

                message:
                    ""

            };


        /*
        -------------------------
        PORTA
        -------------------------
        */

        case "porta":

            if (
                !isValidKeyword(
                    parameters.keyword
                )
            ) {

                return {

                    valid:
                        false,

                    message:
                        "Porta keyword must contain letters A-Z."

                };
            }


            return {

                valid:
                    true,

                message:
                    ""

            };


        /*
        -------------------------
        COLUMNAR
        -------------------------
        */

        case "columnar":

            if (
                !isValidColumnarKey(
                    parameters.key
                )
            ) {

                return {

                    valid:
                        false,

                    message:
                        "Columnar key must use each number from 1 through the number of columns exactly once."

                };
            }


            return {

                valid:
                    true,

                message:
                    ""

            };


        /*
        -------------------------
        NIHILIST
        -------------------------
        */

        case "nihilist":

            if (
                !isValidKeyword(
                    parameters.squareKeyword
                )
            ) {

                return {

                    valid:
                        false,

                    message:
                        "Nihilist square keyword must contain letters A-Z."

                };
            }


            if (
                !isValidKeyword(
                    parameters.additiveKeyword
                )
            ) {

                return {

                    valid:
                        false,

                    message:
                        "Nihilist additive keyword must contain letters A-Z."

                };
            }


            return {

                valid:
                    true,

                message:
                    ""

            };


        /*
        -------------------------
        HILL
        -------------------------
        */

        case "hill":

            if (
                !isValidHillMatrix(
                    parameters.matrix
                )
            ) {

                return {

                    valid:
                        false,

                    message:
                        "Hill matrix must be 2x2 or 3x3 and its determinant must be coprime to 26."

                };
            }


            return {

                valid:
                    true,

                message:
                    ""

            };


        /*
        -------------------------
        FRACTIONATED MORSE
        -------------------------
        */

        case "fractionatedmorse":

            if (
                !isValidKeyword(
                    parameters.keyword
                )
            ) {

                return {

                    valid:
                        false,

                    message:
                        "Fractionated Morse keyword must contain letters A-Z."

                };
            }


            return {

                valid:
                    true,

                message:
                    ""

            };


        /*
        -------------------------
        UNKNOWN CIPHER
        -------------------------
        */

        default:

            return {

                valid:
                    false,

                message:
                    `Unknown cipher type: ${type}`

            };
    }
}

    /*
    =====================================================
    PUBLIC API
    =====================================================
    */

    return {

        encrypt,

        generate,

        generateKey,

        createDailyPuzzle,

        createHints,

        getSupportedCiphers,

        getDisplayName,

        selfTest,
        
        validateParameters,

        isValidSubstitutionAlphabet,

        isValidAffineKey,

        isValidHillMatrix,

        isValidColumnarKey,


        caesar: {

            encrypt:
                caesarEncrypt,

            generateKey:
                generateCaesarKey

        },


        atbash: {

            encrypt:
                atbashEncrypt

        },


        affine: {

            encrypt:
                affineEncrypt,

            generateKey:
                generateAffineKey

        },


        railFence: {

            encrypt:
                railFenceEncrypt,

            generateKey:
                generateRailFenceKey

        },


        baconian: {

            encrypt:
                baconianEncrypt

        },


        aristocrat: {

            encrypt:
                substitutionEncrypt,

            generateKey:
                generateSubstitutionKey

        },


        patristocrat: {

            encrypt:
                patristocratEncrypt,

            generateKey:
                generatePatristocratKey

        },


        porta: {

            encrypt:
                portaEncrypt,

            generateKey:
                generatePortaKey

        },


        columnar: {

            encrypt:
                columnarEncrypt,

            generateKey:
                generateColumnarKey

        },


        nihilist: {

            encrypt:
                nihilistEncrypt,

            generateKey:
                generateNihilistKey,

            buildSquare:
                buildPolybiusSquare

        },


        hill: {

            encrypt:
                hillEncrypt,

            generateKey:
                generateHillKey,

            validateMatrix:
                validateHillMatrix

        },


        fractionatedMorse: {

            encrypt:
                fractionatedMorseEncrypt,

            generateKey:
                generateFractionatedMorseKey

        }

    };

})();


window.CipherEngine =
    CipherEngine;
/*
=========================================================
THE DAILY CIPHER
Codebusters Expansion v3.0

Adds Science Olympiad-style practice variants while
preserving the v2 CipherEngine API and all legacy IDs.
=========================================================
*/

(() => {

    if (!window.CipherEngine || window.CipherEngine.__codebustersExpanded) {
        return;
    }

    const engine = window.CipherEngine;

    const original = {
        encrypt: engine.encrypt.bind(engine),
        generate: engine.generate.bind(engine),
        generateKey: engine.generateKey.bind(engine),
        createHints: engine.createHints.bind(engine),
        getDisplayName: engine.getDisplayName.bind(engine),
        getSupportedCiphers: engine.getSupportedCiphers.bind(engine),
        validateParameters: engine.validateParameters.bind(engine)
    };

    const ENGLISH_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const SPANISH_ALPHABET = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    const POLYBIUS_ALPHABET = "ABCDEFGHIKLMNOPQRSTUVWXYZ";

    const KEYWORDS = [
        "CIPHER", "SCIENCE", "PUZZLE", "LOGIC", "MATRIX",
        "SIGNAL", "SECRET", "ORBIT", "VECTOR", "NUMBER",
        "PATTERN", "GALAXY", "ENIGMA", "PHOTON", "QUANTUM",
        "NETWORK", "BINARY", "ALGORITHM", "CHEMISTRY", "HISTORY"
    ];

    const FIVE_LETTER_KEYS = [
        "ALERT", "LATER", "STONE", "NOTES", "TRAIN", "NIGHT",
        "LIGHT", "RIVER", "CLOUD", "PLANT", "SOUND", "WORLD",
        "MOUSE", "BRICK", "FLAME", "QUEST", "WATER", "SOLAR"
    ];

    const BACONIAN_SYMBOLS = [
        ["A", "B"],
        ["0", "1"],
        ["X", "O"],
        ["●", "○"],
        ["▲", "△"],
        ["■", "□"]
    ];

    const CRYPTARITHM_WORDS = [
        "CIPHER", "PUZZLE", "SECRET", "LOGIC", "MATRIX",
        "NUMBER", "CODE", "SOLVE", "PATTERN", "SIGNAL"
    ];

    const HOMOPHONIC_FREQUENCIES = {
        E: 13, T: 9, A: 8, O: 8, I: 7, N: 7, S: 6, H: 6,
        R: 6, D: 4, L: 4, C: 3, U: 3, M: 2, W: 2, F: 2,
        G: 2, Y: 2, P: 2, B: 1, V: 1, K: 1, J: 1, X: 1,
        Q: 1, Z: 1
    };

    function randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function shuffle(array) {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function cleanEnglish(text) {
        return String(text || "")
            .toUpperCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    function cleanSpanish(text) {
        return String(text || "")
            .toUpperCase()
            .replace(/Ñ/g, "\u0000")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\u0000/g, "Ñ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function lettersOnly(text, alphabet = ENGLISH_ALPHABET) {
        const allowed = new Set(alphabet.split(""));
        return String(text || "")
            .toUpperCase()
            .split("")
            .filter(character => allowed.has(character))
            .join("");
    }

    function uniqueKeywordAlphabet(keyword, alphabet = ENGLISH_ALPHABET) {
        const output = [];
        for (const character of lettersOnly(keyword, alphabet) + alphabet) {
            if (!output.includes(character)) {
                output.push(character);
            }
        }
        return output.join("");
    }

    function rotateRight(text, amount) {
        const value = String(text || "");
        if (!value.length) return value;
        const normalized = ((Number(amount) % value.length) + value.length) % value.length;
        if (!normalized) return value;
        return value.slice(-normalized) + value.slice(0, -normalized);
    }

    function groupString(text, size = 5) {
        const groups = [];
        for (let i = 0; i < text.length; i += size) {
            groups.push(text.slice(i, i + size));
        }
        return groups.join(" ");
    }

    function createCrib(plaintext, minimumLength) {
        const letters = lettersOnly(plaintext);
        if (!letters.length) return "";
        const length = Math.min(
            letters.length,
            Math.max(minimumLength, Math.min(letters.length, minimumLength + randomInteger(0, 3)))
        );
        const start = randomInteger(0, Math.max(0, letters.length - length));
        return letters.slice(start, start + length);
    }

    function randomDerangement(alphabet = ENGLISH_ALPHABET) {
        const source = alphabet.split("");
        let result;
        let attempts = 0;
        do {
            result = shuffle(source);
            attempts++;
        } while (
            result.some((letter, index) => letter === source[index])
            && attempts < 10000
        );
        return result.join("");
    }

    function buildSubstitutionRows(kind, keyword, offset = 0, alphabet = ENGLISH_ALPHABET) {
        const keyed = uniqueKeywordAlphabet(keyword, alphabet);
        const n = alphabet.length;
        const safeOffset = ((Number(offset) % n) + n) % n;

        if (kind === "k1") {
            return {
                plainRow: rotateRight(keyed, safeOffset),
                cipherRow: alphabet
            };
        }

        if (kind === "k2") {
            return {
                plainRow: alphabet,
                cipherRow: rotateRight(keyed, safeOffset)
            };
        }

        if (kind === "k3") {
            const shift = safeOffset || 1;
            return {
                plainRow: keyed,
                cipherRow: rotateRight(keyed, shift)
            };
        }

        return {
            plainRow: alphabet,
            cipherRow: randomDerangement(alphabet)
        };
    }

    function substituteWithRows(plaintext, rows, alphabet = ENGLISH_ALPHABET) {
        const source = cleanEnglish(plaintext);
        return source
            .split("")
            .map(character => {
                if (!alphabet.includes(character)) return character;
                const index = rows.plainRow.indexOf(character);
                return index >= 0 ? rows.cipherRow[index] : character;
            })
            .join("");
    }

    function generateKeyedSubstitutionKey(kind, alphabet = ENGLISH_ALPHABET) {
        const keyword = randomItem(KEYWORDS);
        const offset = randomInteger(1, alphabet.length - 1);
        const rows = buildSubstitutionRows(kind, keyword, offset, alphabet);
        return {
            keyType: kind.toUpperCase(),
            keyword,
            offset,
            alphabet: rows.cipherRow,
            plainAlphabet: rows.plainRow,
            cipherAlphabet: rows.cipherRow
        };
    }

    function encryptKeyedSubstitution(plaintext, parameters, kind, patristocrat = false, spanish = false) {
        const alphabet = spanish ? SPANISH_ALPHABET : ENGLISH_ALPHABET;
        const keyword = parameters.keyword || randomItem(KEYWORDS);
        const offset = Number.isInteger(Number(parameters.offset)) ? Number(parameters.offset) : 1;
        const rows = buildSubstitutionRows(kind, keyword, offset, alphabet);
        const cleaned = spanish ? cleanSpanish(plaintext) : cleanEnglish(plaintext);
        let ciphertext = substituteWithRows(cleaned, rows, alphabet);
        if (patristocrat) {
            ciphertext = groupString(lettersOnly(ciphertext, alphabet), 5);
        }
        return ciphertext;
    }

    function baconianIndex(character) {
        return ENGLISH_ALPHABET.indexOf(character);
    }

    function numberToBaconian(index) {
        return index
            .toString(2)
            .padStart(5, "0")
            .replace(/0/g, "A")
            .replace(/1/g, "B");
    }

    function baconianVariantEncrypt(plaintext, parameters = {}) {
        const pair = Array.isArray(parameters.symbolPair)
            ? parameters.symbolPair
            : ["A", "B"];
        const [symbolA, symbolB] = pair;
        return cleanEnglish(plaintext)
            .split("")
            .map(character => {
                if (character === " ") return "/";
                const index = baconianIndex(character);
                if (index < 0) return character;
                return numberToBaconian(index)
                    .replace(/A/g, "\u0000")
                    .replace(/B/g, symbolB)
                    .replace(/\u0000/g, symbolA);
            })
            .join(" ");
    }

    function normalizePolybiusLetter(character) {
        const upper = String(character || "").toUpperCase();
        return upper === "J" ? "I" : upper;
    }

    function buildPolybiusSquare(keyword) {
        const keyed = uniqueKeywordAlphabet(
            lettersOnly(String(keyword || "").replace(/J/g, "I"), POLYBIUS_ALPHABET),
            POLYBIUS_ALPHABET
        );
        const grid = [];
        const coordinates = {};
        for (let row = 0; row < 5; row++) {
            const values = [];
            for (let col = 0; col < 5; col++) {
                const letter = keyed[row * 5 + col];
                values.push(letter);
                coordinates[letter] = { row, col };
            }
            grid.push(values);
        }
        coordinates.J = coordinates.I;
        return { alphabet: keyed, grid, coordinates };
    }

    function checkerboardEncrypt(plaintext, parameters) {
        const square = buildPolybiusSquare(parameters.polybiusKeyword);
        const rowKey = lettersOnly(parameters.rowKeyword).slice(0, 5);
        const colKey = lettersOnly(parameters.columnKeyword).slice(0, 5);
        if (rowKey.length !== 5 || colKey.length !== 5) {
            throw new Error("Checkerboard row and column keywords must each contain at least five letters.");
        }

        const pairs = [];
        for (const character of cleanEnglish(plaintext)) {
            if (character === " ") {
                pairs.push("/");
                continue;
            }
            const letter = normalizePolybiusLetter(character);
            if (!square.coordinates[letter]) continue;
            const { row, col } = square.coordinates[letter];
            pairs.push(`${rowKey[row]}${colKey[col]}`);
        }
        return pairs.join(" ");
    }

    function generateCheckerboardKey() {
        const rowKeyword = randomItem(FIVE_LETTER_KEYS);
        let columnKeyword = randomItem(FIVE_LETTER_KEYS);
        while (columnKeyword === rowKeyword) {
            columnKeyword = randomItem(FIVE_LETTER_KEYS);
        }
        return {
            polybiusKeyword: randomItem(KEYWORDS),
            rowKeyword,
            columnKeyword
        };
    }

    function generateHomophonicMap() {
        const tokens = Array.from({ length: 100 }, (_, index) => String(index).padStart(2, "0"));
        const shuffled = shuffle(tokens);
        const mapping = {};
        ENGLISH_ALPHABET.split("").forEach(letter => {
            mapping[letter] = [shuffled.pop()];
        });

        const weightedLetters = [];
        for (const [letter, weight] of Object.entries(HOMOPHONIC_FREQUENCIES)) {
            for (let i = 0; i < weight; i++) weightedLetters.push(letter);
        }

        while (shuffled.length) {
            const letter = randomItem(weightedLetters);
            mapping[letter].push(shuffled.pop());
        }

        return mapping;
    }

    function homophonicEncrypt(plaintext, parameters) {
        const mapping = parameters.mapping;
        if (!mapping || typeof mapping !== "object") {
            throw new Error("Homophonic cipher requires a number mapping.");
        }
        const output = [];
        for (const character of cleanEnglish(plaintext)) {
            if (character === " ") {
                output.push("/");
                continue;
            }
            if (!mapping[character]?.length) continue;
            output.push(randomItem(mapping[character]));
        }
        return output.join(" ");
    }

    function cryptarithmGenerate(difficulty) {
        const answer = randomItem(CRYPTARITHM_WORDS);
        const requiredLetters = [...new Set(answer.split(""))];
        const digitPool = shuffle([0,1,2,3,4,5,6,7,8,9]);
        const letterToDigit = {};
        const digitToLetter = {};

        requiredLetters.forEach((letter, index) => {
            const digit = digitPool[index];
            letterToDigit[letter] = digit;
            digitToLetter[digit] = letter;
        });

        const fillerLetters = shuffle(
            ENGLISH_ALPHABET.split("").filter(letter => !requiredLetters.includes(letter))
        );
        let fillerIndex = 0;
        for (let digit = 0; digit <= 9; digit++) {
            if (!digitToLetter[digit]) {
                const letter = fillerLetters[fillerIndex++];
                digitToLetter[digit] = letter;
                letterToDigit[letter] = digit;
            }
        }

        function encodeNumber(number) {
            return String(number)
                .split("")
                .map(digit => digitToLetter[Number(digit)])
                .join("");
        }

        const equations = [];
        const usedDigits = new Set();
        let attempts = 0;
        while (equations.length < (difficulty === "Hard" ? 5 : 4) && attempts < 1000) {
            attempts++;
            const a = randomInteger(120, 899);
            const b = randomInteger(120, 899);
            const sum = a + b;
            if (sum > 999) continue;
            const raw = `${a}${b}${sum}`;
            raw.split("").forEach(d => usedDigits.add(Number(d)));
            equations.push(`${encodeNumber(a)} + ${encodeNumber(b)} = ${encodeNumber(sum)}`);
        }

        const extractionDigits = answer
            .split("")
            .map(letter => letterToDigit[letter])
            .join(" ");

        return {
            type: "cryptarithm",
            difficulty,
            plaintext: answer,
            ciphertext: equations.join("\n") + `\n\nEXTRACT: ${extractionDigits}`,
            parameters: {
                letterToDigit,
                extractionDigits
            },
            hints: [
                { level: 1, title: "Structure", text: "Each letter represents exactly one decimal digit, and each digit maps to one letter." },
                { level: 2, title: "Arithmetic", text: "Use column addition and carrying to constrain the letter-to-digit mapping." },
                { level: 3, title: "Extraction", text: "After solving the mapping, convert the extraction digits back into letters." },
                { level: 4, title: "Strong Hint", text: `The extracted answer has ${answer.length} letters.` }
            ],
            challengeInfo: [
                { label: "TASK", value: "Solve the base-10 letter-to-digit equations, then decode the extraction digits." }
            ],
            generatedAt: new Date().toISOString()
        };
    }

    function normalizeType(type) {
        return String(type || "").toLowerCase();
    }

    function generateExpandedKey(type, difficulty) {
        switch (normalizeType(type)) {
            case "aristocrat-k1": return generateKeyedSubstitutionKey("k1");
            case "aristocrat-k2": return generateKeyedSubstitutionKey("k2");
            case "aristocrat-random": return { keyType: "RANDOM", alphabet: randomDerangement() };
            case "patristocrat-k1": return generateKeyedSubstitutionKey("k1");
            case "patristocrat-k2": return generateKeyedSubstitutionKey("k2");
            case "substitution-k3": return generateKeyedSubstitutionKey("k3");
            case "xenocrypt-k1": return generateKeyedSubstitutionKey("k1", SPANISH_ALPHABET);
            case "xenocrypt-k2": return generateKeyedSubstitutionKey("k2", SPANISH_ALPHABET);
            case "xenocrypt-cryptanalysis": {
                const kind = randomItem(["k1", "k2"]);
                return generateKeyedSubstitutionKey(kind, SPANISH_ALPHABET);
            }
            case "baconian-variant": return { symbolPair: randomItem(BACONIAN_SYMBOLS) };
            case "porta-cryptanalysis": return original.generateKey("porta", difficulty);
            case "fractionatedmorse-cryptanalysis": return original.generateKey("fractionatedmorse", difficulty);
            case "nihilist-cryptanalysis": return original.generateKey("nihilist", difficulty);
            case "columnar-cryptanalysis": {
                let key = original.generateKey("columnar", difficulty).key;
                if (key.length > 9) key = key.slice(0, 9);
                return { key };
            }
            case "checkerboard":
            case "checkerboard-cryptanalysis": return generateCheckerboardKey();
            case "homophonic":
            case "homophonic-cryptanalysis": return { mapping: generateHomophonicMap() };
            default: return original.generateKey(type, difficulty);
        }
    }

    function expandedEncrypt(type, plaintext, parameters = {}) {
        switch (normalizeType(type)) {
            case "aristocrat-k1": return encryptKeyedSubstitution(plaintext, parameters, "k1");
            case "aristocrat-k2": return encryptKeyedSubstitution(plaintext, parameters, "k2");
            case "aristocrat-random": return original.encrypt("aristocrat", plaintext, parameters);
            case "patristocrat-k1": return encryptKeyedSubstitution(plaintext, parameters, "k1", true);
            case "patristocrat-k2": return encryptKeyedSubstitution(plaintext, parameters, "k2", true);
            case "substitution-k3": return encryptKeyedSubstitution(plaintext, parameters, "k3");
            case "xenocrypt-k1": return encryptKeyedSubstitution(plaintext, parameters, "k1", false, true);
            case "xenocrypt-k2": return encryptKeyedSubstitution(plaintext, parameters, "k2", false, true);
            case "xenocrypt-cryptanalysis": {
                const kind = String(parameters.keyType || "K1").toLowerCase();
                return encryptKeyedSubstitution(plaintext, parameters, kind, false, true);
            }
            case "baconian-variant": return baconianVariantEncrypt(plaintext, parameters);
            case "porta-cryptanalysis": return original.encrypt("porta", plaintext, parameters);
            case "fractionatedmorse-cryptanalysis": return original.encrypt("fractionatedmorse", plaintext, parameters);
            case "nihilist-cryptanalysis": return original.encrypt("nihilist", plaintext, parameters);
            case "columnar-cryptanalysis": return original.encrypt("columnar", plaintext, parameters);
            case "checkerboard":
            case "checkerboard-cryptanalysis": return checkerboardEncrypt(plaintext, parameters);
            case "homophonic":
            case "homophonic-cryptanalysis": return homophonicEncrypt(plaintext, parameters);
            case "cryptarithm": throw new Error("Cryptarithm puzzles are generated with CipherEngine.generate().");
            default: return original.encrypt(type, plaintext, parameters);
        }
    }

    function createExpandedHints(type, parameters = {}) {
        switch (normalizeType(type)) {
            case "aristocrat-k1":
            case "aristocrat-k2":
            case "aristocrat-random":
            case "patristocrat-k1":
            case "patristocrat-k2":
            case "substitution-k3":
                return [
                    { level: 1, title: "Cipher Family", text: "This is a monoalphabetic substitution cipher." },
                    { level: 2, title: "Pattern Hint", text: "Repeated plaintext letters always use the same ciphertext letter." },
                    { level: 3, title: "Key Type", text: parameters.keyType === "RANDOM" ? "The substitution alphabet is random." : `This uses a ${parameters.keyType} keyed alphabet.` },
                    ...(parameters.keyword ? [{ level: 4, title: "Strong Hint", text: `The keyword is ${parameters.keyword}.` }] : [])
                ];
            case "xenocrypt-k1":
            case "xenocrypt-k2":
            case "xenocrypt-cryptanalysis":
                return [
                    { level: 1, title: "Language", text: "The plaintext is Spanish." },
                    { level: 2, title: "Substitution", text: "Treat this as a monoalphabetic substitution, including Ñ as its own letter." },
                    { level: 3, title: "Key Type", text: `This uses a ${parameters.keyType || "K1/K2"} alphabet.` },
                    { level: 4, title: "Strong Hint", text: `The English keyword is ${parameters.keyword}.` }
                ];
            case "baconian-variant":
                return [
                    { level: 1, title: "Binary Structure", text: "Every plaintext letter is represented by a five-symbol binary-style group." },
                    { level: 2, title: "Two Classes", text: "Only two distinct symbol classes matter." },
                    { level: 3, title: "Grouping", text: "Read the ciphertext in groups of five symbols." },
                    { level: 4, title: "Strong Hint", text: `Treat ${parameters.symbolPair?.[0]} as A and ${parameters.symbolPair?.[1]} as B.` }
                ];
            case "fractionatedmorse-cryptanalysis":
                return [
                    { level: 1, title: "Cipher Family", text: "Morse symbols are fractionated into trigrams and mapped through a keyed alphabet." },
                    { level: 2, title: "Crib", text: `Use the supplied crib: ${parameters.crib}.` },
                    { level: 3, title: "Structure", text: "Morse letters are separated before the stream is split into groups of three." },
                    { level: 4, title: "Strong Hint", text: `The hidden keyword is ${parameters.keyword}.` }
                ];
            case "porta-cryptanalysis":
                return [
                    { level: 1, title: "Reciprocal Cipher", text: "Porta encryption and decryption use the same transformation." },
                    { level: 2, title: "Crib", text: `Use the supplied crib: ${parameters.crib}.` },
                    { level: 3, title: "Keyword Pairs", text: "Keyword letters work in A/B, C/D, E/F pairs." },
                    { level: 4, title: "Strong Hint", text: `The hidden keyword is ${parameters.keyword}.` }
                ];
            case "nihilist-cryptanalysis":
                return [
                    { level: 1, title: "Polybius", text: "Each number combines a plaintext Polybius value and a repeating-key Polybius value." },
                    { level: 2, title: "Crib", text: `Use the supplied crib: ${parameters.crib}.` },
                    { level: 3, title: "Keyword Length", text: `The additive keyword has ${lettersOnly(parameters.additiveKeyword).length} letters.` },
                    { level: 4, title: "Strong Hint", text: `Polybius keyword: ${parameters.squareKeyword}; additive keyword: ${parameters.additiveKeyword}.` }
                ];
            case "columnar-cryptanalysis":
                return [
                    { level: 1, title: "Transposition", text: "The plaintext letters were rearranged by columns, not substituted." },
                    { level: 2, title: "Crib", text: `Use the supplied crib: ${parameters.crib}.` },
                    { level: 3, title: "Columns", text: `There are ${parameters.key.length} columns.` },
                    { level: 4, title: "Strong Hint", text: `The hidden column order is ${parameters.key.join("-")}.` }
                ];
            case "checkerboard":
                return [
                    { level: 1, title: "Polybius", text: "Each ciphertext pair identifies a row and column in a keyed 5x5 Polybius square." },
                    { level: 2, title: "Headers", text: "The first character of each pair is a row header; the second is a column header." },
                    { level: 3, title: "Given", text: `The Polybius keyword is ${parameters.polybiusKeyword}.` },
                    { level: 4, title: "Strong Hint", text: `Row keyword: ${parameters.rowKeyword}; column keyword: ${parameters.columnKeyword}.` }
                ];
            case "checkerboard-cryptanalysis":
                return [
                    { level: 1, title: "Polybius", text: "Treat each two-letter pair as one substitution symbol." },
                    { level: 2, title: "Crib", text: `Use the supplied crib: ${parameters.crib}.` },
                    { level: 3, title: "Headers", text: "Five row symbols and five column symbols define the checkerboard." },
                    { level: 4, title: "Strong Hint", text: `Polybius key: ${parameters.polybiusKeyword}; row: ${parameters.rowKeyword}; column: ${parameters.columnKeyword}.` }
                ];
            case "homophonic":
            case "homophonic-cryptanalysis":
                return [
                    { level: 1, title: "Homophones", text: "A plaintext letter can be represented by several different two-digit numbers." },
                    { level: 2, title: "One-way Mapping", text: "Each number belongs to only one plaintext letter." },
                    ...(parameters.crib ? [{ level: 3, title: "Crib", text: `Use the supplied crib: ${parameters.crib}.` }] : [{ level: 3, title: "Frequency", text: "Combine the frequencies of number symbols that may represent the same plaintext letter." }]),
                    { level: 4, title: "Strong Hint", text: "Start with common English letters and repeated word patterns." }
                ];
            default:
                return original.createHints(type, parameters);
        }
    }

    function createChallengeInfo(type, parameters) {
        switch (normalizeType(type)) {
            case "aristocrat-k1": return [{ label: "FORMAT", value: "Aristocrat • spaces preserved • K1 alphabet" }];
            case "aristocrat-k2": return [{ label: "FORMAT", value: "Aristocrat • spaces preserved • K2 alphabet" }];
            case "aristocrat-random": return [{ label: "FORMAT", value: "Aristocrat • spaces preserved • random alphabet" }];
            case "patristocrat-k1": return [{ label: "FORMAT", value: "Patristocrat • spaces removed • K1 alphabet" }];
            case "patristocrat-k2": return [{ label: "FORMAT", value: "Patristocrat • spaces removed • K2 alphabet" }];
            case "substitution-k3": return [{ label: "FORMAT", value: "Division C K3 monoalphabetic substitution" }];
            case "xenocrypt-k1": return [{ label: "LANGUAGE", value: "Spanish" }, { label: "KEY TYPE", value: "K1 • English keyword" }];
            case "xenocrypt-k2": return [{ label: "LANGUAGE", value: "Spanish" }, { label: "KEY TYPE", value: "K2 • English keyword" }];
            case "xenocrypt-cryptanalysis": return [{ label: "LANGUAGE", value: "Spanish" }, { label: "CRIB", value: parameters.crib }];
            case "baconian-variant": return [{ label: "TASK", value: "Identify the two symbol classes, convert them to A/B, then decode groups of five." }];
            case "porta": return [{ label: "GIVEN KEY", value: parameters.keyword }];
            case "porta-cryptanalysis": return [{ label: "CRIB", value: parameters.crib }];
            case "fractionatedmorse-cryptanalysis": return [{ label: "CRIB", value: parameters.crib }];
            case "nihilist": return [
                { label: "POLYBIUS KEY", value: parameters.squareKeyword },
                { label: "ADDITIVE KEY", value: parameters.additiveKeyword },
                ...(parameters.crib ? [{ label: "CRIB", value: parameters.crib }] : [])
            ];
            case "nihilist-cryptanalysis": return [{ label: "CRIB", value: parameters.crib }];
            case "columnar-cryptanalysis": return [
                { label: "COLUMNS", value: String(parameters.key.length) },
                { label: "CRIB", value: parameters.crib }
            ];
            case "checkerboard": return [{ label: "POLYBIUS KEY", value: parameters.polybiusKeyword }];
            case "checkerboard-cryptanalysis": return [{ label: "CRIB", value: parameters.crib }];
            case "homophonic": return [{ label: "TASK", value: "Decode the homophonic number substitution." }];
            case "homophonic-cryptanalysis": return [{ label: "CRIB", value: parameters.crib }];
            default: return [];
        }
    }

    function completeParameters(type, parameters, plaintext) {
        const output = { ...parameters };
        switch (normalizeType(type)) {
            case "fractionatedmorse-cryptanalysis":
                output.crib = output.crib || createCrib(plaintext, 4);
                break;
            case "porta-cryptanalysis":
                output.crib = output.crib || createCrib(plaintext, 3);
                break;
            case "nihilist": {
                const max = Math.max(1, lettersOnly(output.additiveKeyword).length);
                output.crib = output.crib || createCrib(plaintext, Math.min(max, 3)).slice(0, max);
                break;
            }
            case "nihilist-cryptanalysis": {
                const min = Math.max(3, lettersOnly(output.additiveKeyword).length);
                output.crib = output.crib || createCrib(plaintext, min);
                break;
            }
            case "columnar-cryptanalysis":
                output.crib = output.crib || createCrib(plaintext, Math.max(2, output.key.length - 1));
                break;
            case "checkerboard-cryptanalysis":
            case "homophonic-cryptanalysis":
            case "xenocrypt-cryptanalysis":
                output.crib = output.crib || createCrib(plaintext, 5);
                break;
        }
        return output;
    }

    function expandedGenerate(options = {}) {
        const type = normalizeType(options.type);
        const difficulty = options.difficulty || "Easy";

        if (type === "cryptarithm") {
            return cryptarithmGenerate(difficulty);
        }

        const expandedTypes = new Set([
            "aristocrat-k1", "aristocrat-k2", "aristocrat-random",
            "patristocrat-k1", "patristocrat-k2", "substitution-k3",
            "xenocrypt-k1", "xenocrypt-k2", "xenocrypt-cryptanalysis",
            "baconian-variant", "porta-cryptanalysis",
            "fractionatedmorse-cryptanalysis", "nihilist-cryptanalysis",
            "columnar-cryptanalysis", "checkerboard", "checkerboard-cryptanalysis",
            "homophonic", "homophonic-cryptanalysis"
        ]);

        if (!expandedTypes.has(type)) {
            const legacy = original.generate(options);
            const parameters =
                type === "nihilist"
                    ? completeParameters(
                        type,
                        legacy.parameters,
                        legacy.plaintext
                    )
                    : legacy.parameters;

            return {
                ...legacy,
                parameters,
                challengeInfo: createChallengeInfo(type, parameters)
            };
        }

        const plaintext = type.startsWith("xenocrypt")
            ? cleanSpanish(options.plaintext)
            : cleanEnglish(options.plaintext);

        if (!plaintext) {
            throw new Error("Plaintext is required.");
        }

        let parameters = options.parameters || generateExpandedKey(type, difficulty);
        parameters = completeParameters(type, parameters, plaintext);

        return {
            type,
            difficulty,
            plaintext,
            ciphertext: expandedEncrypt(type, plaintext, parameters),
            parameters,
            hints: createExpandedHints(type, parameters),
            challengeInfo: createChallengeInfo(type, parameters),
            generatedAt: new Date().toISOString()
        };
    }

    const DISPLAY_NAMES = {
        "aristocrat-k1": "Aristocrat — K1",
        "aristocrat-k2": "Aristocrat — K2",
        "aristocrat-random": "Aristocrat — Random Alphabet",
        "patristocrat-k1": "Patristocrat — K1",
        "patristocrat-k2": "Patristocrat — K2",
        "substitution-k3": "Monoalphabetic Substitution — K3",
        "xenocrypt-k1": "Spanish Xenocrypt — K1",
        "xenocrypt-k2": "Spanish Xenocrypt — K2",
        "xenocrypt-cryptanalysis": "Spanish Xenocrypt — Cryptanalysis",
        "baconian-variant": "Baconian — Symbol Variant",
        "fractionatedmorse-cryptanalysis": "Fractionated Morse — Cryptanalysis",
        "porta-cryptanalysis": "Porta — Cryptanalysis",
        "cryptarithm": "Cryptarithm — Base 10",
        "nihilist-cryptanalysis": "Nihilist — Cryptanalysis",
        "columnar-cryptanalysis": "Complete Columnar — Cryptanalysis",
        "checkerboard": "5×5 Checkerboard — Given Polybius Key",
        "checkerboard-cryptanalysis": "5×5 Checkerboard — Cryptanalysis",
        "homophonic": "Homophonic Cipher",
        "homophonic-cryptanalysis": "Homophonic — Cryptanalysis"
    };

    const EXPANDED_CIPHERS = [
        { id: "aristocrat-k1", name: DISPLAY_NAMES["aristocrat-k1"], category: "Monoalphabetic", divisions: "B/C", tier: "Regional+" },
        { id: "aristocrat-k2", name: DISPLAY_NAMES["aristocrat-k2"], category: "Monoalphabetic", divisions: "B/C", tier: "Regional+" },
        { id: "aristocrat-random", name: DISPLAY_NAMES["aristocrat-random"], category: "Monoalphabetic", divisions: "B/C", tier: "Regional+" },
        { id: "patristocrat-k1", name: DISPLAY_NAMES["patristocrat-k1"], category: "Monoalphabetic", divisions: "B/C", tier: "Regional+" },
        { id: "patristocrat-k2", name: DISPLAY_NAMES["patristocrat-k2"], category: "Monoalphabetic", divisions: "B/C", tier: "Regional+" },
        { id: "substitution-k3", name: DISPLAY_NAMES["substitution-k3"], category: "Monoalphabetic", divisions: "C", tier: "Regional+" },
        { id: "xenocrypt-k1", name: DISPLAY_NAMES["xenocrypt-k1"], category: "Xenocrypt", divisions: "B/C", tier: "Regional+" },
        { id: "xenocrypt-k2", name: DISPLAY_NAMES["xenocrypt-k2"], category: "Xenocrypt", divisions: "B/C", tier: "Regional+" },
        { id: "xenocrypt-cryptanalysis", name: DISPLAY_NAMES["xenocrypt-cryptanalysis"], category: "Xenocrypt", divisions: "B/C", tier: "State/National" },
        { id: "baconian-variant", name: DISPLAY_NAMES["baconian-variant"], category: "Encoding", divisions: "B/C", tier: "Regional+" },
        { id: "fractionatedmorse-cryptanalysis", name: DISPLAY_NAMES["fractionatedmorse-cryptanalysis"], category: "Morse / Fractionation", divisions: "B/C", tier: "Regional+" },
        { id: "porta-cryptanalysis", name: DISPLAY_NAMES["porta-cryptanalysis"], category: "Polyalphabetic", divisions: "B/C", tier: "State/National" },
        { id: "cryptarithm", name: DISPLAY_NAMES.cryptarithm, category: "Cryptarithm", divisions: "B/C", tier: "Regional+" },
        { id: "nihilist-cryptanalysis", name: DISPLAY_NAMES["nihilist-cryptanalysis"], category: "Polybius / Additive", divisions: "B/C", tier: "State/National" },
        { id: "columnar-cryptanalysis", name: DISPLAY_NAMES["columnar-cryptanalysis"], category: "Transposition", divisions: "B/C", tier: "Regional+" },
        { id: "checkerboard", name: DISPLAY_NAMES.checkerboard, category: "Checkerboard", divisions: "B/C", tier: "Regional+" },
        { id: "checkerboard-cryptanalysis", name: DISPLAY_NAMES["checkerboard-cryptanalysis"], category: "Checkerboard", divisions: "B/C", tier: "State/National" },
        { id: "homophonic", name: DISPLAY_NAMES.homophonic, category: "Homophonic", divisions: "B/C", tier: "Regional+" },
        { id: "homophonic-cryptanalysis", name: DISPLAY_NAMES["homophonic-cryptanalysis"], category: "Homophonic", divisions: "B/C", tier: "State/National" }
    ];

    engine.encrypt = expandedEncrypt;
    engine.generate = expandedGenerate;
    engine.generateKey = generateExpandedKey;
    engine.createHints = createExpandedHints;
    engine.createChallengeInfo = createChallengeInfo;

    engine.getDisplayName = function(type) {
        return DISPLAY_NAMES[normalizeType(type)] || original.getDisplayName(type);
    };

    engine.getSupportedCiphers = function() {
        const legacy = original.getSupportedCiphers();
        const replacedLegacyIds = new Set(["aristocrat", "patristocrat"]);
        return [
            ...legacy.filter(item => !replacedLegacyIds.has(item.id)),
            ...EXPANDED_CIPHERS
        ];
    };

    engine.validateParameters = function(type, parameters = {}) {
        const normalized = normalizeType(type);
        const expanded = new Set(EXPANDED_CIPHERS.map(item => item.id));
        if (!expanded.has(normalized)) {
            return original.validateParameters(type, parameters);
        }
        try {
            if (["aristocrat-k1", "aristocrat-k2", "patristocrat-k1", "patristocrat-k2", "substitution-k3", "xenocrypt-k1", "xenocrypt-k2", "xenocrypt-cryptanalysis"].includes(normalized)) {
                if (!parameters.keyword) throw new Error("A keyword is required.");
            }
            if (normalized === "aristocrat-random" && !engine.isValidSubstitutionAlphabet(parameters.alphabet)) {
                throw new Error("A valid substitution alphabet is required.");
            }
            if (["checkerboard", "checkerboard-cryptanalysis"].includes(normalized)) {
                if (!parameters.polybiusKeyword || !parameters.rowKeyword || !parameters.columnKeyword) {
                    throw new Error("Checkerboard requires a Polybius key plus row and column keywords.");
                }
            }
            if (["homophonic", "homophonic-cryptanalysis"].includes(normalized) && !parameters.mapping) {
                throw new Error("Homophonic mapping is required.");
            }
            return { valid: true, message: "" };
        } catch (error) {
            return { valid: false, message: error.message };
        }
    };

    engine.codebusters = {
        buildSubstitutionRows,
        buildPolybiusSquare,
        checkerboardEncrypt,
        homophonicEncrypt,
        generateHomophonicMap,
        createCrib,
        spanishAlphabet: SPANISH_ALPHABET
    };

    engine.__codebustersExpanded = true;

})();
