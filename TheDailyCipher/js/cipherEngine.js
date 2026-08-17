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