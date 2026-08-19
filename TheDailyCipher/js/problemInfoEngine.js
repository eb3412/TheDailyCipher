/*
=========================================================
THE DAILY CIPHER
Problem Information Engine v4.2
=========================================================
Purpose:
- Separate required problem givens from optional hints.
- Model Science Olympiad-style question context consistently.
- Provide one shared renderer/schema for Daily and Practice.

The current public Codebusters guidance is used as the baseline;
season-specific rules can be adjusted here without changing the
cipher implementations or page renderers.
=========================================================
*/

const ProblemInfoEngine = (() => {
    "use strict";

    const ENGLISH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const POLYBIUS = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
    const MORSE = {
        A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
        G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
        M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
        S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
        Y: "-.--", Z: "--.."
    };

    const MORSE_TRIGRAMS = (() => {
        const out = [];
        for (const a of [".", "-", "x"]) {
            for (const b of [".", "-", "x"]) {
                for (const c of [".", "-", "x"]) {
                    const t = a + b + c;
                    if (t !== "xxx") out.push(t);
                }
            }
        }
        return out;
    })();

    function normalizeType(value) {
        return String(value || "").trim().toLowerCase();
    }

    function normalizeDifficulty(value) {
        const x = String(value || "Medium").trim().toLowerCase();
        if (x === "easy") return "Easy";
        if (x === "hard") return "Hard";
        return "Medium";
    }

    function cleanEnglish(value) {
        return String(value || "")
            .toUpperCase()
            .replace(/[^A-Z ]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function lettersOnly(value) {
        return String(value || "").toUpperCase().replace(/[^A-ZÑ]/g, "");
    }

    function mod(value, modulus) {
        return ((value % modulus) + modulus) % modulus;
    }

    function gcd(a, b) {
        a = Math.abs(Number(a));
        b = Math.abs(Number(b));
        while (b) [a, b] = [b, a % b];
        return a;
    }

    function modInverse(a, m) {
        a = mod(Number(a), m);
        for (let x = 1; x < m; x++) {
            if (mod(a * x, m) === 1) return x;
        }
        return null;
    }

    function determinant(matrix) {
        if (!Array.isArray(matrix)) return null;
        if (matrix.length === 2) {
            return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        }
        if (matrix.length === 3) {
            const [[a,b,c],[d,e,f],[g,h,i]] = matrix;
            return a * (e*i - f*h) - b * (d*i - f*g) + c * (d*h - e*g);
        }
        return null;
    }

    function inverse2x2(matrix) {
        if (!Array.isArray(matrix) || matrix.length !== 2) return null;
        const det = mod(determinant(matrix), 26);
        const inv = modInverse(det, 26);
        if (inv === null) return null;
        const [[a,b],[c,d]] = matrix;
        return [
            [mod(inv * d, 26), mod(inv * -b, 26)],
            [mod(inv * -c, 26), mod(inv * a, 26)]
        ];
    }

    function uniqueAlphabet(keyword, alphabet = ENGLISH) {
        let out = "";
        for (const char of (lettersOnly(keyword) + alphabet)) {
            const normalized = alphabet === POLYBIUS && char === "J" ? "I" : char;
            if (alphabet.includes(normalized) && !out.includes(normalized)) out += normalized;
        }
        return out;
    }

    function buildPolybiusGrid(keyword) {
        const keyed = uniqueAlphabet(String(keyword || "").replace(/J/g, "I"), POLYBIUS);
        const grid = [];
        const values = {};
        for (let r = 0; r < 5; r++) {
            const row = [];
            for (let c = 0; c < 5; c++) {
                const letter = keyed[r * 5 + c];
                row.push(letter);
                values[letter] = (r + 1) * 10 + (c + 1);
            }
            grid.push(row);
        }
        values.J = values.I;
        return { grid, values, alphabet: keyed };
    }

    function positionOfCrib(plaintext, crib) {
        const source = lettersOnly(plaintext);
        const needle = lettersOnly(crib);
        if (!needle) return { start: -1, end: -1, crib: "" };
        const start = source.indexOf(needle);
        return { start, end: start < 0 ? -1 : start + needle.length - 1, crib: needle };
    }

    function displayCrib(plaintext, crib) {
        const position = positionOfCrib(plaintext, crib);
        if (position.start < 0) return lettersOnly(crib);

        const source = String(plaintext || "")
            .toUpperCase()
            .replace(/[^A-ZÑ ]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        let letterIndex = 0;
        let startChar = -1;
        let endChar = -1;
        for (let i = 0; i < source.length; i++) {
            if (!/[A-ZÑ]/.test(source[i])) continue;
            if (letterIndex === position.start && startChar < 0) startChar = i;
            if (letterIndex === position.end) {
                endChar = i;
                break;
            }
            letterIndex++;
        }

        if (startChar < 0 || endChar < startChar) return lettersOnly(crib);
        return source.slice(startChar, endChar + 1).replace(/\s+/g, " ").trim();
    }

    function cipherLettersOnly(value) {
        return String(value || "").toUpperCase().replace(/[^A-ZÑ]/g, "");
    }

    function numericTokens(value) {
        return String(value || "").match(/\d+/g) || [];
    }

    function homophonicTokens(value) {
        return String(value || "").match(/\d{1,3}/g) || [];
    }

    function homophonicKeyword(value) {
        return String(value || "").toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "").slice(0, 4);
    }

    function homophonicKeywordPattern(value, positions = [0, 2]) {
        const keyword = homophonicKeyword(value);
        if (keyword.length !== 4) return "";
        return [...keyword].map((ch, i) => positions.includes(i) ? ch : "_").join("");
    }

    function positionalCipherSegment(type, plaintext, ciphertext, crib) {
        const pos = positionOfCrib(plaintext, crib);
        if (pos.start < 0) return null;
        const length = pos.crib.length;
        const t = normalizeType(type);

        if ([
            "aristocrat-k1", "aristocrat-k2", "aristocrat-random", "aristocrat",
            "substitution-k3", "xenocrypt-k1", "xenocrypt-k2", "xenocrypt-cryptanalysis",
            "porta", "porta-cryptanalysis"
        ].includes(t)) {
            const letters = cipherLettersOnly(ciphertext);
            return letters.slice(pos.start, pos.start + length);
        }

        if (["nihilist", "nihilist-cryptanalysis"].includes(t)) {
            const tokens = numericTokens(ciphertext);
            return tokens.slice(pos.start, pos.start + length).join(" ");
        }

        if (["homophonic", "homophonic-cryptanalysis"].includes(t)) {
            const tokens = homophonicTokens(ciphertext);
            return tokens.slice(pos.start, pos.start + length).join(" ");
        }

        if (["checkerboard", "checkerboard-cryptanalysis"].includes(t)) {
            const tokens = String(ciphertext || "")
                .split(/\s+/)
                .filter(token => token !== "/" && /^[A-ZÑ]{2}$/.test(token));
            return tokens.slice(pos.start, pos.start + length).join(" ");
        }

        return null;
    }

    function fractionatedMorseCribDetails(plaintext, ciphertext, crib, keyword) {
        const clean = cleanEnglish(plaintext);
        const needle = lettersOnly(crib);
        if (!clean || !needle) return null;

        const letters = [];
        let stream = "";
        const words = clean.split(" ").filter(Boolean);
        let letterIndex = 0;
        words.forEach((word, wi) => {
            word.split("").forEach((letter, li) => {
                const start = stream.length;
                stream += MORSE[letter];
                const end = stream.length;
                letters.push({ letter, index: letterIndex++, start, end });
                if (li < word.length - 1) stream += "x";
            });
            if (wi < words.length - 1) stream += "xx";
        });

        const sourceLetters = letters.map(item => item.letter).join("");
        const startLetter = sourceLetters.indexOf(needle);
        if (startLetter < 0) return null;
        const endLetter = startLetter + needle.length - 1;
        const streamStart = letters[startLetter].start;
        const streamEnd = letters[endLetter].end;
        const firstTrig = Math.floor(streamStart / 3);
        const lastTrigExclusive = Math.ceil(streamEnd / 3);
        const ungroupedCipher = cipherLettersOnly(ciphertext);
        const cipherSegment = ungroupedCipher.slice(firstTrig, lastTrigExclusive);

        let padded = stream;
        while (padded.length % 3) padded += "x";
        const mappings = [];
        const seen = new Set();
        for (let trigIndex = firstTrig; trigIndex < lastTrigExclusive; trigIndex++) {
            const trigStart = trigIndex * 3;
            const trigEnd = trigStart + 3;
            if (trigStart < streamStart || trigEnd > streamEnd) continue;
            const trigram = padded.slice(trigStart, trigEnd);
            const cipherLetter = ungroupedCipher[trigIndex];
            if (!cipherLetter || !trigram || seen.has(cipherLetter)) continue;
            seen.add(cipherLetter);
            mappings.push({ left: cipherLetter, right: trigram.replace(/x/g, "×") });
        }

        return {
            startLetter,
            endLetter,
            cipherSegment,
            mappings,
            streamWindow: padded.slice(firstTrig * 3, lastTrigExclusive * 3).replace(/x/g, "×"),
            keywordLength: lettersOnly(keyword).length
        };
    }

    function firstWord(plaintext) {
        return cleanEnglish(plaintext).split(" ").filter(Boolean)[0] || lettersOnly(plaintext).slice(0, 5);
    }

    function firstLetterPair(plaintext, ciphertext, type) {
        const p = lettersOnly(plaintext)[0];
        if (!p) return null;
        const c = positionalCipherSegment(type, plaintext, ciphertext, p);
        return c ? `${c} → ${p}` : null;
    }

    function getProblemMode(type) {
        const t = normalizeType(type);
        if (t === "cryptarithm") return "solve";
        if (t.includes("cryptanalysis")) return "cryptanalysis";
        if ([
            "caesar", "aristocrat", "aristocrat-k1", "aristocrat-k2", "aristocrat-random",
            "patristocrat", "patristocrat-k1", "patristocrat-k2", "substitution-k3",
            "xenocrypt-k1", "xenocrypt-k2",
            "baconian", "baconian-variant", "checkerboard", "homophonic"
        ].includes(t)) return "cryptanalysis";
        return "decode";
    }

    function makeInfo(mode, rows, options = {}) {
        return {
            schemaVersion: 1,
            title: "STARTING INFORMATION",
            subtitle: options.subtitle || "Everything below is part of the problem and is given before you begin. Optional hints are separate.",
            mode,
            rows: rows.filter(Boolean),
            note: options.note || "Required givens never cost hint points."
        };
    }

    function text(label, value) {
        return value === undefined || value === null || value === "" ? null : { kind: "text", label, value: String(value) };
    }

    function code(label, value) {
        return value === undefined || value === null || value === "" ? null : { kind: "code", label, value: String(value) };
    }

    function matrix(label, value) {
        return Array.isArray(value) ? { kind: "matrix", label, value } : null;
    }

    function grid(label, value, options = {}) {
        return Array.isArray(value) ? {
            kind: "grid", label, value,
            rowHeaders: options.rowHeaders || null,
            colHeaders: options.colHeaders || null,
            corner: options.corner || ""
        } : null;
    }

    function mapping(label, value) {
        return Array.isArray(value) && value.length ? { kind: "mapping", label, value } : null;
    }

    function createStartingInfo(input = {}) {
        const type = normalizeType(input.type || input.cipher_id);
        const difficulty = normalizeDifficulty(input.difficulty);
        const p = input.parameters || {};
        const plaintext = input.plaintext || input.solution || "";
        const ciphertext = input.ciphertext || "";
        const mode = getProblemMode(type);
        const rows = [text("PROBLEM MODE", mode === "solve" ? "Solve the stated puzzle" : mode === "decode" ? "Decode with the supplied key information" : "Cryptanalysis — recover the plaintext from structure and clues")];

        switch (type) {
            case "caesar":
                rows.push(text("GIVEN", "Caesar cipher; the shift is intentionally not supplied."));
                if (difficulty === "Easy") rows.push(text("HOW TO START", "Test constant shifts until normal language appears."));
                break;

            case "atbash":
                rows.push(text("ALPHABET PAIRING", "A↔Z, B↔Y, C↔X, …"));
                break;

            case "affine":
                rows.push(code("AFFINE KEY", `a = ${p.a}; b = ${p.b}`));
                rows.push(text("LETTER VALUES", "A=0, B=1, …, Z=25; arithmetic is modulo 26."));
                if (difficulty === "Easy") rows.push(code("ENCRYPTION FORM", "E(x) = (ax + b) mod 26"));
                break;

            case "railfence":
                rows.push(text("NUMBER OF RAILS", p.rails));
                if (difficulty === "Easy") rows.push(text("PATH", "The writing path begins on the top rail and moves down, then back up in a zigzag."));
                break;

            case "baconian":
                rows.push(text("ALPHABET", "24-entry Baconian alphabet: I/J share a value and U/V share a value."));
                rows.push(text("GROUPING", "Read A/B in groups of five; A acts like 0 and B acts like 1."));
                break;

            case "baconian-variant": {
                const pair = Array.isArray(p.symbolPair) ? p.symbolPair : [];
                rows.push(text("ALPHABET", "24-entry Baconian alphabet: I/J share a value and U/V share a value."));
                rows.push(text("STRUCTURE", "Each plaintext letter is represented by five symbols drawn from two visual classes."));
                if (difficulty === "Easy" && pair.length >= 2) {
                    rows.push(code("SYMBOL CLASSES", `${pair[0]} = A   •   ${pair[1]} = B`));
                } else {
                    rows.push(text("SYMBOL CLASSES", "Determine which of the two symbol classes acts as A and which acts as B."));
                }
                break;
            }

            case "aristocrat":
            case "aristocrat-k1":
            case "aristocrat-k2":
            case "aristocrat-random":
                rows.push(text("FORMAT", "Aristocrat — word spaces and punctuation are preserved."));
                rows.push(text("ALPHABET TYPE", p.keyType || (type.endsWith("k1") ? "K1" : type.endsWith("k2") ? "K2" : type.includes("random") || type === "aristocrat" ? "Random monoalphabetic" : "Monoalphabetic")));
                if (difficulty === "Easy") rows.push(text("SOLVING TOOL", "Word patterns, repeated letters, and frequency analysis are expected; the keyword itself is not given."));
                break;

            case "patristocrat":
            case "patristocrat-k1":
            case "patristocrat-k2":
                rows.push(text("FORMAT", "Patristocrat — original spaces are removed; ciphertext is grouped only for readability."));
                rows.push(text("ALPHABET TYPE", p.keyType || (type.endsWith("k1") ? "K1" : type.endsWith("k2") ? "K2" : "Monoalphabetic substitution")));
                break;

            case "substitution-k3":
                rows.push(text("FORMAT", "K3 monoalphabetic substitution."));
                rows.push(text("KEY RELATION", "Both plaintext and ciphertext alphabets are keyed rotations; recover the substitution by cryptanalysis."));
                break;

            case "xenocrypt-k1":
            case "xenocrypt-k2":
            case "xenocrypt-cryptanalysis": {
                rows.push(text("PLAINTEXT LANGUAGE", "Spanish (Ñ is treated as its own letter)."));
                rows.push(text("KEY TYPE", p.keyType || (type.endsWith("k1") ? "K1" : type.endsWith("k2") ? "K2" : "K1 or K2")));
                rows.push(text("KEYWORD LANGUAGE", "The hidden keyed alphabet uses an English keyword."));
                if (type === "xenocrypt-cryptanalysis" && p.crib) {
                    const seg = positionalCipherSegment(type, plaintext, ciphertext, p.crib);
                    rows.push(code("KNOWN PLAINTEXT", displayCrib(plaintext, p.crib)));
                    rows.push(text("LOCATION", `Letters ${positionOfCrib(plaintext, p.crib).start + 1}–${positionOfCrib(plaintext, p.crib).end + 1} of the alphabetic plaintext`));
                    if (seg) rows.push(code("CORRESPONDING CIPHERTEXT", seg));
                }
                break;
            }

            case "porta":
                rows.push(code("KEYWORD", p.keyword));
                rows.push(text("KEY USE", "Repeat the keyword across alphabetic characters; Porta is reciprocal, so the same tableau operation decrypts."));
                break;

            case "porta-cryptanalysis": {
                const pos = positionOfCrib(plaintext, p.crib);
                const seg = positionalCipherSegment(type, plaintext, ciphertext, p.crib);
                rows.push(text("KEY LENGTH", lettersOnly(p.keyword).length || "Unknown"));
                rows.push(code("KNOWN PLAINTEXT", displayCrib(plaintext, p.crib)));
                if (pos.start >= 0) rows.push(text("LOCATION", `Plaintext letters ${pos.start + 1}–${pos.end + 1}`));
                if (seg) rows.push(code("CORRESPONDING CIPHERTEXT", seg));
                rows.push(text("WHAT IS HIDDEN", "The keyword itself is not supplied."));
                break;
            }

            case "hill":
                rows.push(matrix("KEY MATRIX", p.matrix));
                rows.push(text("LETTER VALUES", "A=0, B=1, …, Z=25; reduce matrix arithmetic modulo 26."));
                rows.push(text("BLOCK SIZE", Array.isArray(p.matrix) ? `${p.matrix.length} letters` : "Use the matrix dimension"));
                if (difficulty === "Medium") rows.push(text("DECRYPTION TASK", "Find/use the inverse of the supplied matrix modulo 26, then process each ciphertext block."));
                break;

            case "nihilist":
                rows.push(code("POLYBIUS KEY", p.squareKeyword));
                rows.push(code("ADDITIVE KEY", p.additiveKeyword));
                rows.push(text("SQUARE CONVENTION", "5×5 keyed Polybius square, row first then column; I/J share a cell."));
                if (difficulty === "Easy") {
                    const square = buildPolybiusGrid(p.squareKeyword);
                    rows.push(grid("CONSTRUCTED POLYBIUS SQUARE", square.grid, { rowHeaders:["1","2","3","4","5"], colHeaders:["1","2","3","4","5"], corner:"#" }));
                }
                break;

            case "nihilist-cryptanalysis": {
                const pos = positionOfCrib(plaintext, p.crib);
                const seg = positionalCipherSegment(type, plaintext, ciphertext, p.crib);
                rows.push(code("KNOWN PLAINTEXT", displayCrib(plaintext, p.crib)));
                if (pos.start >= 0) rows.push(text("LOCATION", `Plaintext letters ${pos.start + 1}–${pos.end + 1}`));
                if (seg) rows.push(code("CORRESPONDING CIPHERTEXT NUMBERS", seg));
                rows.push(text("WHAT IS HIDDEN", "Recover the Polybius square and repeating additive key from the numerical relationships."));
                break;
            }

            case "columnar":
                rows.push(code("COLUMN ORDER", Array.isArray(p.key) ? p.key.join("-") : p.key));
                rows.push(text("READING RULE", "Plaintext was written across rows and ciphertext was read down columns in the supplied order."));
                break;

            case "columnar-cryptanalysis": {
                rows.push(code("CRIB", displayCrib(plaintext, p.crib)));
                rows.push(text("TASK", "Use the crib to determine the number of columns and the column order; neither is given directly."));
                break;
            }

            case "fractionatedmorse":
                rows.push(code("KEYWORD", p.keyword));
                rows.push(text("MORSE CONVENTION", "× separates Morse letters and ×× separates words; the stream is split into 3-symbol morslets."));
                break;

            case "fractionatedmorse-cryptanalysis": {
                const details = fractionatedMorseCribDetails(plaintext, ciphertext, p.crib, p.keyword);
                rows.push(code("KNOWN PLAINTEXT", displayCrib(plaintext, p.crib)));
                if (details) {
                    rows.push(text("LOCATION", `Plaintext letters ${details.startLetter + 1}–${details.endLetter + 1}`));
                    rows.push(code("CORRESPONDING CIPHERTEXT WINDOW", details.cipherSegment));
                    if (details.mappings.length) rows.push(mapping("MORSLET MAPPINGS REVEALED BY THE CRIB", details.mappings));
                }
                rows.push(text("WHAT IS HIDDEN", "Recover the keyed Fractionated Morse alphabet using the crib and standard morslet order."));
                break;
            }

            case "checkerboard":
                rows.push(code("POLYBIUS KEY", p.polybiusKeyword));
                rows.push(text("SQUARE CONVENTION", "Build a 5×5 keyed Polybius square with I/J combined."));
                rows.push(text("HEADERS", "Each ciphertext pair is row-header symbol followed by column-header symbol; determine header order by cryptanalysis."));
                break;

            case "checkerboard-cryptanalysis": {
                const pos = positionOfCrib(plaintext, p.crib);
                const seg = positionalCipherSegment(type, plaintext, ciphertext, p.crib);
                rows.push(code("KNOWN PLAINTEXT", displayCrib(plaintext, p.crib)));
                if (pos.start >= 0) rows.push(text("LOCATION", `Plaintext letters ${pos.start + 1}–${pos.end + 1}`));
                if (seg) rows.push(code("CORRESPONDING PAIRS", seg));
                rows.push(text("WHAT IS HIDDEN", "Recover the keyed square and row/column header order."));
                break;
            }

            case "homophonic":
            case "homophonic-cryptanalysis": {
                rows.push(text("MAPPING RULE", "Each plaintext letter has four possible number values, one in each 25-number band; I/J share a position. Every number still decodes to only one plaintext letter."));
                rows.push(text("NUMBER BANDS", "1–25, 26–50, 51–75, and 76–100. A four-unique-letter keyword anchors the first value in each band."));
                rows.push(text("BLOCKING", Number(p.blockSize) > 0 ? `Cipher units are grouped in blocks of ${p.blockSize}; those blocks are not word boundaries.` : "Word breaks are shown for this introductory version."));
                if (type === "homophonic-cryptanalysis" && p.crib) {
                    const pos = positionOfCrib(plaintext, p.crib);
                    const seg = positionalCipherSegment(type, plaintext, ciphertext, p.crib);
                    rows.push(code("KNOWN PLAINTEXT", displayCrib(plaintext, p.crib)));
                    if (pos.start >= 0) rows.push(text("LOCATION", `Plaintext letters ${pos.start + 1}–${pos.end + 1}`));
                    if (seg) rows.push(code("CORRESPONDING CIPHER UNITS", seg));
                    rows.push(text("WHAT IS HIDDEN", "Recover the four-letter keyword structure and plaintext from the crib plus the four number bands."));
                } else {
                    const keyword = homophonicKeyword(p.keyword);
                    if (difficulty === "Easy") {
                        rows.push(code("KEYWORD PATTERN", homophonicKeywordPattern(keyword, [0, 2])));
                    } else if (keyword) {
                        rows.push(code("KNOWN KEYWORD LETTERS", `${keyword[0]}, ${keyword[2]} (positions are not supplied)`));
                    }
                }
                break;
            }

            case "cryptarithm":
                rows.push(text("NUMBER SYSTEM", "Base 10."));
                rows.push(text("MAPPING RULE", "Each letter represents exactly one digit, and each digit represents only one letter."));
                rows.push(text("LEADING ZERO RULE", "A multi-digit number cannot begin with 0."));
                rows.push(text("TASK", "Solve the addition equations, then translate the digits on the EXTRACT line back into letters."));
                break;

            default:
                rows.push(text("GIVEN", "Use the named cipher and the information shown in the ciphertext."));
        }

        return makeInfo(mode, rows);
    }

    function createHints(input = {}) {
        const type = normalizeType(input.type || input.cipher_id);
        const difficulty = normalizeDifficulty(input.difficulty);
        const p = input.parameters || {};
        const plaintext = input.plaintext || input.solution || "";
        const ciphertext = input.ciphertext || "";
        const first = firstWord(plaintext);
        const pair = firstLetterPair(plaintext, ciphertext, type);
        const hints = [];
        const push = (title, textValue) => {
            if (!textValue) return;
            hints.push({ level: hints.length + 1, title, text: String(textValue) });
        };

        switch (type) {
            case "caesar":
                push("Frequency", "Look for common one-letter and short-word patterns after each trial shift.");
                push("Direction", "To decrypt, move ciphertext letters backward by a candidate shift.");
                push("Plaintext foothold", first ? `The plaintext begins with ${first[0]}.` : null);
                push("Strong hint", `The shift is ${p.shift}.`);
                break;
            case "atbash":
                push("Pairing", "Work from both ends of the alphabet: A↔Z, B↔Y, C↔X.");
                push("Self-check", "Atbash is reciprocal: applying it twice returns the original text.");
                push("Plaintext foothold", first ? `The first plaintext word is ${first}.` : null);
                break;
            case "affine": {
                const inv = modInverse(p.a, 26);
                push("Decryption formula", "Use x = a⁻¹(y − b) mod 26.");
                push("Find the inverse", inv !== null ? `${p.a}⁻¹ mod 26 = ${inv}.` : "Find the modular inverse of a.");
                push("First letter check", pair);
                push("Strong hint", first ? `The first plaintext word is ${first}.` : null);
                break;
            }
            case "railfence":
                push("Cycle", `With ${p.rails} rails, the zigzag repeats every ${Math.max(2, 2 * (Number(p.rails) - 1))} positions.`);
                push("Reconstruction", "Mark the zigzag rail pattern first, then fill each rail with ciphertext in order.");
                push("Plaintext foothold", first ? `The plaintext starts ${first.slice(0, Math.min(3, first.length))}…` : null);
                push("Strong hint", first ? `The first plaintext word is ${first}.` : null);
                break;
            case "baconian":
                push("Binary", "Treat A as 0 and B as 1; each five-symbol block is one value.");
                push("Alphabet convention", "Remember the 24-entry sequence combines I/J and U/V.");
                push("First block", first ? `The first decoded letter belongs to ${first[0] === "J" ? "I/J" : first[0] === "V" ? "U/V" : first[0]}.` : null);
                break;
            case "baconian-variant": {
                const sym = Array.isArray(p.symbolPair) ? p.symbolPair : [];
                push("Two classes", "Ignore the visual decoration; classify every symbol into one of only two groups.");
                push("Test both assignments", "If your first A/B assignment produces nonsense, swap the two classes.");
                if (difficulty !== "Easy" && sym.length >= 2) push("Symbol assignment", `${sym[0]} acts as A and ${sym[1]} acts as B.`);
                push("Plaintext foothold", first ? `The first plaintext word is ${first}.` : null);
                break;
            }
            case "aristocrat":
            case "aristocrat-k1":
            case "aristocrat-k2":
            case "aristocrat-random":
                push("Word patterns", "Start with one-letter words, repeated-letter words, and repeated word shapes.");
                push("Frequency", "Compare common ciphertext letters with E, T, A, O, I, and N, but verify against word patterns.");
                push("Known mapping", pair);
                push("Strong hint", first ? `The first plaintext word is ${first}.` : null);
                break;
            case "patristocrat":
            case "patristocrat-k1":
            case "patristocrat-k2":
                push("No word breaks", "Do not treat the displayed five-letter groups as words; they are only for readability.");
                push("Frequency", "Use global letter frequency and repeated sequences before guessing word boundaries.");
                push("Crib", first ? `The plaintext begins ${lettersOnly(plaintext).slice(0, Math.min(5, lettersOnly(plaintext).length))}.` : null);
                push("Strong hint", first ? `The first plaintext word is ${first}.` : null);
                break;
            case "substitution-k3":
                push("K3 structure", "Both alphabets are keyed versions of the same keyword alphabet, offset from each other.");
                push("Patterns", "Solve it first as an ordinary monoalphabetic substitution; use K3 structure to confirm the recovered alphabet.");
                push("Known mapping", pair);
                push("Strong hint", first ? `The plaintext starts ${first}.` : null);
                break;
            case "xenocrypt-k1":
            case "xenocrypt-k2":
            case "xenocrypt-cryptanalysis":
                push("Spanish frequency", "Common Spanish letters include E, A, O, S, N and R; short words such as DE, LA, EL and EN are useful anchors.");
                push("Ñ", "Treat Ñ as a distinct plaintext letter, not as N.");
                push("Known mapping", pair);
                push("Strong hint", first ? `The first plaintext word is ${first}.` : null);
                break;
            case "porta":
                push("Keyword pairs", "A/B use the same tableau row, C/D the next, then E/F, and so on.");
                push("Reciprocal", "Use the same substitution process for decryption as for encryption.");
                push("First letter", pair);
                push("Strong hint", first ? `The first plaintext word is ${first}.` : null);
                break;
            case "porta-cryptanalysis":
                push("Use the crib", "Align the supplied plaintext/ciphertext crib and determine which Porta tableau rows are possible at each position.");
                push("Pair classes", "Each recovered key position identifies a letter pair: A/B, C/D, E/F, … rather than one exact key letter immediately.");
                push("Keyword foothold", p.keyword ? `The first hidden keyword letter is ${lettersOnly(p.keyword)[0]}.` : null);
                push("Strong hint", p.keyword ? `The hidden keyword is ${p.keyword}.` : null);
                break;
            case "hill": {
                const det = determinant(p.matrix);
                const inv = inverse2x2(p.matrix);
                push("Determinant", det !== null ? `The determinant is ${det}; reduce it modulo 26 before finding its inverse.` : "Compute the determinant modulo 26.");
                push("Block order", "Convert each ciphertext block to a column vector, multiply by the inverse key matrix, then reduce each entry modulo 26.");
                if (inv) push("Inverse matrix", `The inverse key matrix modulo 26 is [[${inv[0].join(",")}],[${inv[1].join(",")}]].`);
                else push("Inverse matrix", "For a 3×3 key, compute the adjugate and multiply by the modular inverse of the determinant.");
                push("Strong hint", first ? `The plaintext begins ${first}.` : null);
                break;
            }
            case "nihilist": {
                const square = p.squareKeyword ? buildPolybiusGrid(p.squareKeyword) : null;
                push("Build the square", "Remove duplicate letters from the Polybius key, append the unused alphabet with I/J combined, then fill the square row by row.");
                push("Subtract the key", "Convert the repeating additive keyword through the same square and subtract those values from the ciphertext numbers.");
                if (square && p.additiveKeyword) {
                    const keyLetter = String(p.additiveKeyword)[0]?.toUpperCase().replace("J","I");
                    push("First key value", keyLetter && square.values[keyLetter] ? `${keyLetter} has Polybius value ${square.values[keyLetter]}.` : null);
                }
                push("Strong hint", first ? `The plaintext begins ${first}.` : null);
                break;
            }
            case "nihilist-cryptanalysis":
                push("Use differences", "For each known plaintext position, subtract candidate Polybius values from the supplied ciphertext numbers; repeating differences expose the additive key cycle.");
                push("Square constraints", "Valid Polybius values use only digits 1–5, so impossible differences can eliminate candidate square placements.");
                push("Key foothold", p.additiveKeyword ? `The additive keyword begins with ${lettersOnly(p.additiveKeyword)[0]}.` : null);
                push("Strong hint", p.squareKeyword && p.additiveKeyword ? `Hidden Polybius key: ${p.squareKeyword}; additive key: ${p.additiveKeyword}.` : null);
                break;
            case "columnar":
                push("Column lengths", "Work out how many characters belong in each column before reconstructing rows.");
                push("Undo the readout", "Place ciphertext chunks back into columns according to the supplied order, then read across rows.");
                push("Plaintext foothold", first ? `The plaintext starts ${first.slice(0, Math.min(4, first.length))}…` : null);
                push("Strong hint", first ? `The first plaintext word is ${first}.` : null);
                break;
            case "columnar-cryptanalysis":
                push("Use the crib", "Try the crib across candidate row widths and reject placements that cannot produce the observed column chunks.");
                push("Factors", "Candidate column counts are constrained by ciphertext length and any padding behavior.");
                push("Column count", Array.isArray(p.key) ? `The actual puzzle uses ${p.key.length} columns.` : null);
                push("Strong hint", Array.isArray(p.key) ? `The hidden column order is ${p.key.join("-")}.` : null);
                break;
            case "fractionatedmorse":
                push("Reverse the keyed alphabet", "Map each ciphertext letter back to its standard morslet position using the supplied keyword alphabet.");
                push("Separators", "After joining morslets, × separates letters and ×× separates words.");
                push("First word", first ? `The first plaintext word is ${first}.` : null);
                break;
            case "fractionatedmorse-cryptanalysis":
                push("Exploit mappings", "Every crib-derived ciphertext-letter ↔ morslet mapping constrains one position in the keyed alphabet.");
                push("Standard order", "There are 26 used morslets in fixed .../---/× combinations; ××× is omitted.");
                push("Keyword foothold", p.keyword ? `The hidden keyword begins with ${lettersOnly(p.keyword)[0]}.` : null);
                push("Strong hint", p.keyword ? `The hidden keyword is ${p.keyword}.` : null);
                break;
            case "checkerboard":
                push("Separate headers", "Collect all symbols that occur first in each pair and all symbols that occur second; these are the row and column header sets.");
                push("Use the square", "Build the keyed 5×5 square first, then test header ordering against repeated words and letter frequencies.");
                push("Header foothold", p.rowKeyword && p.columnKeyword ? `The first row header is ${lettersOnly(p.rowKeyword)[0]} and first column header is ${lettersOnly(p.columnKeyword)[0]}.` : null);
                push("Strong hint", p.rowKeyword && p.columnKeyword ? `Row order: ${lettersOnly(p.rowKeyword).slice(0,5)}; column order: ${lettersOnly(p.columnKeyword).slice(0,5)}.` : null);
                break;
            case "checkerboard-cryptanalysis":
                push("Crib pairs", "Use each known plaintext letter to constrain both its Polybius cell and the row/column header symbols in the corresponding ciphertext pair.");
                push("Repeated coordinates", "Repeated first symbols share a row; repeated second symbols share a column.");
                push("Polybius foothold", p.polybiusKeyword ? `The hidden Polybius key begins with ${lettersOnly(p.polybiusKeyword)[0]}.` : null);
                push("Strong hint", p.polybiusKeyword && p.rowKeyword && p.columnKeyword ? `Polybius key ${p.polybiusKeyword}; row ${p.rowKeyword}; column ${p.columnKeyword}.` : null);
                break;
            case "homophonic":
            case "homophonic-cryptanalysis": {
                const keyword = homophonicKeyword(p.keyword);
                push("Four alphabets", "Reduce each cipher number to its 1–25 position inside its band. Numbers separated by 25 belong to parallel homophonic alphabets.");
                if (type === "homophonic-cryptanalysis") {
                    push("Exploit the crib", "Use the supplied plaintext/cipher-unit alignment to place letters in one or more of the four number bands, then propagate the keyword rotation.");
                } else {
                    push("Keyword placement", keyword ? `One of the supplied keyword letters, ${keyword[0]}, is the first letter of the four-letter keyword.` : "Test positions of the supplied keyword letters in a four-letter word.");
                }
                push("Keyword foothold", keyword ? `The keyword pattern is ${homophonicKeywordPattern(keyword, [0, 2])}.` : null);
                push("Strong hint", keyword ? `The hidden keyword is ${keyword}.` : (first ? `The first plaintext word is ${first}.` : null));
                break;
            }
            case "cryptarithm": {
                push("Start with carries", "Work from the rightmost addition column and list the possible carry values into the next column.");
                push("Repeated letters", "The same letter has the same digit everywhere; different letters cannot share a digit.");
                const entries = p.letterToDigit ? Object.entries(p.letterToDigit) : [];
                if (entries.length) push("Digit foothold", `${entries[0][0]} = ${entries[0][1]}.`);
                push("Strong hint", first ? `The extracted answer begins with ${lettersOnly(plaintext)[0]}.` : null);
                break;
            }
            default:
                push("Strategy", "Work from the cipher's defining structure and verify every guess against the full message.");
                push("Plaintext foothold", first ? `The plaintext begins ${first}.` : null);
        }

        return hints.slice(0, 4).map((hint, index) => ({ ...hint, level: index + 1 }));
    }

    function validatePuzzleContext(puzzle = {}) {
        const errors = [];
        const type = normalizeType(puzzle.cipher_id || puzzle.type);
        const info = puzzle.startingInfo || createStartingInfo({ ...puzzle, type });
        const rows = Array.isArray(info?.rows) ? info.rows : [];
        const labels = new Set(rows.map(row => String(row.label || "").toUpperCase()));
        const p = puzzle.parameters || {};

        if (!rows.length) errors.push("Starting information is empty.");
        if (!Array.isArray(puzzle.hints) || puzzle.hints.length < 2) errors.push("Puzzle should have at least two optional hints.");

        const need = label => { if (!labels.has(label)) errors.push(`Missing required starting-information field: ${label}.`); };
        if (type === "affine") need("AFFINE KEY");
        if (type === "railfence") need("NUMBER OF RAILS");
        if (type === "hill") need("KEY MATRIX");
        if (type === "porta") need("KEYWORD");
        if (type === "nihilist") { need("POLYBIUS KEY"); need("ADDITIVE KEY"); }
        if (type === "fractionatedmorse") need("KEYWORD");
        if (type === "checkerboard") need("POLYBIUS KEY");
        if (type.includes("cryptanalysis") && ["porta-cryptanalysis","nihilist-cryptanalysis","fractionatedmorse-cryptanalysis","columnar-cryptanalysis","checkerboard-cryptanalysis","homophonic-cryptanalysis","xenocrypt-cryptanalysis"].includes(type)) {
            const hasCrib = labels.has("KNOWN PLAINTEXT") || labels.has("CRIB");
            if (!hasCrib) errors.push("Cryptanalysis puzzle is missing its supplied crib.");
        }
        if (type === "columnar-cryptanalysis" && labels.has("COLUMNS")) errors.push("Complete Columnar cryptanalysis should not reveal the column count up front.");
        if (type === "porta-cryptanalysis" && labels.has("KEYWORD")) errors.push("Porta cryptanalysis should not reveal the hidden keyword up front.");
        if (type === "nihilist-cryptanalysis" && (labels.has("POLYBIUS KEY") || labels.has("ADDITIVE KEY"))) errors.push("Nihilist cryptanalysis should not reveal hidden keys up front.");
        if (type === "fractionatedmorse-cryptanalysis" && labels.has("KEYWORD")) errors.push("Fractionated Morse cryptanalysis should not reveal the hidden keyword up front.");

        // Make sure hints do not merely charge the player for required givens.
        const hintText = (puzzle.hints || []).map(h => String(h.text || "").toUpperCase()).join("\n");
        if (type === "hill" && JSON.stringify(p.matrix || []).length > 2 && /KEY MATRIX IS/.test(hintText)) errors.push("Hill key matrix is duplicated as a paid hint.");
        if (type === "nihilist" && /SQUARE KEYWORD:|POLYBIUS KEY:/.test(hintText) && /ADDITIVE KEYWORD:|ADDITIVE KEY:/.test(hintText)) errors.push("Nihilist required keys are duplicated as a paid hint.");
        if (type === "porta" && /THE KEYWORD IS/.test(hintText)) errors.push("Porta required keyword is duplicated as a paid hint.");
        if (type === "railfence" && /USES \d+ RAIL/.test(hintText)) errors.push("Rail count is duplicated as a paid hint.");
        if (type === "affine" && /A=\d+.*B=\d+/.test(hintText)) errors.push("Affine key values are duplicated as a paid hint.");

        return { valid: errors.length === 0, errors };
    }

    function render(container, startingInfo) {
        if (!container) return;
        container.innerHTML = "";
        if (!startingInfo || !Array.isArray(startingInfo.rows) || !startingInfo.rows.length) {
            container.classList.add("hidden");
            return;
        }
        container.classList.remove("hidden");
        container.classList.add("starting-info-box");

        const header = document.createElement("div");
        header.className = "starting-info-header";
        const title = document.createElement("strong");
        title.className = "starting-info-title";
        title.textContent = startingInfo.title || "STARTING INFORMATION";
        const subtitle = document.createElement("p");
        subtitle.className = "starting-info-subtitle";
        subtitle.textContent = startingInfo.subtitle || "Everything below is given before you begin.";
        header.append(title, subtitle);
        container.appendChild(header);

        const rows = document.createElement("div");
        rows.className = "starting-info-rows";

        for (const row of startingInfo.rows) {
            const item = document.createElement("div");
            item.className = "starting-info-row";
            const label = document.createElement("div");
            label.className = "starting-info-label";
            label.textContent = String(row.label || "INFO").toUpperCase();
            const value = document.createElement("div");
            value.className = "starting-info-value";

            if (row.kind === "matrix" && Array.isArray(row.value)) {
                const matrixWrap = document.createElement("div");
                matrixWrap.className = "starting-info-matrix";
                row.value.forEach(matrixRow => {
                    const line = document.createElement("div");
                    line.className = "starting-info-matrix-row";
                    (Array.isArray(matrixRow) ? matrixRow : []).forEach(cellValue => {
                        const cell = document.createElement("span");
                        cell.textContent = String(cellValue);
                        line.appendChild(cell);
                    });
                    matrixWrap.appendChild(line);
                });
                value.appendChild(matrixWrap);
            } else if (row.kind === "grid" && Array.isArray(row.value)) {
                const table = document.createElement("table");
                table.className = "starting-info-grid";
                if (Array.isArray(row.colHeaders)) {
                    const tr = document.createElement("tr");
                    const corner = document.createElement("th");
                    corner.textContent = row.corner || "";
                    tr.appendChild(corner);
                    row.colHeaders.forEach(h => { const th = document.createElement("th"); th.textContent = String(h); tr.appendChild(th); });
                    table.appendChild(tr);
                }
                row.value.forEach((gridRow, r) => {
                    const tr = document.createElement("tr");
                    if (Array.isArray(row.rowHeaders)) { const th = document.createElement("th"); th.textContent = String(row.rowHeaders[r] ?? ""); tr.appendChild(th); }
                    gridRow.forEach(cellValue => { const td = document.createElement("td"); td.textContent = String(cellValue); tr.appendChild(td); });
                    table.appendChild(tr);
                });
                const scroll = document.createElement("div");
                scroll.className = "starting-info-table-scroll";
                scroll.appendChild(table);
                value.appendChild(scroll);
            } else if (row.kind === "mapping" && Array.isArray(row.value)) {
                const map = document.createElement("div");
                map.className = "starting-info-mapping";
                row.value.forEach(pair => {
                    const chip = document.createElement("span");
                    chip.className = "starting-info-map-chip";
                    chip.textContent = `${pair.left} → ${pair.right}`;
                    map.appendChild(chip);
                });
                value.appendChild(map);
            } else {
                value.textContent = String(row.value ?? "");
                if (row.kind === "code") value.classList.add("starting-info-code");
            }

            item.append(label, value);
            rows.appendChild(item);
        }
        container.appendChild(rows);

        if (startingInfo.note) {
            const note = document.createElement("div");
            note.className = "starting-info-note";
            note.textContent = startingInfo.note;
            container.appendChild(note);
        }
    }

    return {
        createStartingInfo,
        createHints,
        validatePuzzleContext,
        render,
        getProblemMode,
        displayCrib,
        buildPolybiusGrid,
        positionOfCrib,
        positionalCipherSegment,
        fractionatedMorseCribDetails
    };
})();

if (typeof window !== "undefined") window.ProblemInfoEngine = ProblemInfoEngine;
