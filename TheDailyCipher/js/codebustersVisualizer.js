/* =========================================================
   THE DAILY CIPHER — CODEBUSTERS FAMILY VISUALIZERS
========================================================= */
(() => {
    "use strict";

    const ENGLISH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const SPANISH = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    const MORSE = {A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--.."};

    const CONFIG = {
        aristocrat:{title:"Aristocrat Cipher",description:"Compare plaintext and ciphertext alphabets while spaces remain visible.",defaultText:"THE SECRET MESSAGE HIDES BETWEEN THE LINES",modes:[["aristocrat-k1","K1"],["aristocrat-k2","K2"],["aristocrat-random","Random"],["substitution-k3","K3 (Division C)"]]},
        patristocrat:{title:"Patristocrat Cipher",description:"Watch a monoalphabetic substitution after the original word boundaries are removed.",defaultText:"PATTERN RECOGNITION REVEALS IMPORTANT CLUES",modes:[["patristocrat-k1","K1"],["patristocrat-k2","K2"]]},
        baconian:{title:"Baconian Cipher",description:"Convert each letter into a five-symbol binary-style pattern.",defaultText:"CRACK THE CODE",modes:[["baconian-variant","Symbol variant"]]},
        xenocrypt:{title:"Spanish Xenocrypt",description:"Visualize a Spanish monoalphabetic substitution, including Ñ.",defaultText:"LA SEÑAL SECRETA ESTA CERCA",modes:[["xenocrypt-k1","K1"],["xenocrypt-k2","K2"],["xenocrypt-cryptanalysis","Cryptanalysis"]]},
        fractionatedmorse:{title:"Fractionated Morse",description:"See plaintext become Morse, separators, trigrams, then keyed ciphertext.",defaultText:"SECRET MESSAGE",modes:[["fractionatedmorse","Given key"],["fractionatedmorse-cryptanalysis","Cryptanalysis"]]},
        cryptarithm:{title:"Cryptarithm",description:"Generate a fresh base-10 letter-to-digit arithmetic puzzle and reveal its mapping.",defaultText:"",modes:[["cryptarithm","Base 10"]]},
        porta:{title:"Porta Cipher",description:"Apply a repeating keyword to a reciprocal polyalphabetic substitution.",defaultText:"SECRET MESSAGE",modes:[["porta","Given key"],["porta-cryptanalysis","Cryptanalysis"]]},
        nihilist:{title:"Nihilist Cipher",description:"Combine Polybius coordinates with a repeating additive keyword.",defaultText:"SECRET MESSAGE",modes:[["nihilist","Given keys"],["nihilist-cryptanalysis","Cryptanalysis"]]},
        columnar:{title:"Complete Columnar Cipher",description:"Write plaintext into a rectangle and read columns in key order.",defaultText:"SECRET MESSAGE HIDES HERE",modes:[["columnar","Known key"],["columnar-cryptanalysis","Cryptanalysis"]]},
        checkerboard:{title:"5×5 Checkerboard",description:"Turn keyed Polybius coordinates into row/column letter pairs.",defaultText:"SECRET MESSAGE",modes:[["checkerboard","Given key"],["checkerboard-cryptanalysis","Cryptanalysis"]]},
        homophonic:{title:"Homophonic Cipher",description:"Watch common plaintext letters choose among several numeric ciphertext symbols.",defaultText:"SECRET MESSAGE",modes:[["homophonic","Decode mode"],["homophonic-cryptanalysis","Cryptanalysis"]]}
    };

    const escapeHTML = value => String(value ?? "").replace(/[&<>\"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[ch]));
    const lettersOnly = (value, alphabet=ENGLISH) => String(value||"").toUpperCase().split("").filter(ch=>alphabet.includes(ch)).join("");

    function init(){
        const family=document.body.dataset.cipher;
        const cfg=CONFIG[family];
        if(!cfg || typeof CipherEngine === "undefined") return;
        document.getElementById("viz-title").textContent=cfg.title;
        document.getElementById("viz-description").textContent=cfg.description;
        document.title=`${cfg.title} Visualizer | The Daily Cipher`;
        buildControls(family,cfg);
        document.getElementById("viz-run").addEventListener("click",()=>run(family,cfg));
        run(family,cfg);
    }

    function buildControls(family,cfg){
        const controls=document.getElementById("viz-controls");
        let html='';
        if(family!=="cryptarithm"){
            html += `<div class="viz-field"><label for="viz-text">Plaintext</label><textarea id="viz-text" spellcheck="false">${escapeHTML(cfg.defaultText)}</textarea></div>`;
        }
        if(cfg.modes.length>1){
            html += `<div class="viz-field"><label for="viz-mode">Mode</label><select id="viz-mode">${cfg.modes.map(([id,label])=>`<option value="${escapeHTML(id)}">${escapeHTML(label)}</option>`).join("")}</select></div>`;
        }
        html += `<div class="viz-field"><label for="viz-difficulty">Generated key difficulty</label><select id="viz-difficulty"><option>Easy</option><option selected>Medium</option><option>Hard</option></select></div>`;
        controls.innerHTML=html;
    }

    function currentType(cfg){
        return document.getElementById("viz-mode")?.value || cfg.modes[0][0];
    }

    function run(family,cfg){
        const status=document.getElementById("viz-status");
        const output=document.getElementById("viz-output");
        status.className="viz-status";
        status.textContent="";
        try{
            const type=currentType(cfg);
            const difficulty=document.getElementById("viz-difficulty").value;
            const plaintext=family==="cryptarithm" ? undefined : document.getElementById("viz-text").value.trim();
            if(family!=="cryptarithm" && !plaintext) throw new Error("Enter plaintext first.");
            const result=CipherEngine.generate({type,difficulty,plaintext});
            output.innerHTML=renderResult(family,result);
            status.classList.add("viz-success");
            status.textContent="Fresh example generated.";
        }catch(error){
            output.innerHTML=`<div class="viz-card"><div class="viz-error">${escapeHTML(error.message)}</div></div>`;
            status.classList.add("viz-error");
            status.textContent="Could not generate the example.";
            console.error(error);
        }
    }

    function renderResult(family,result){
        const basic=`<section class="viz-card"><h2>Generated example</h2><div class="viz-steps"><div class="viz-step"><div class="viz-step-label">PLAINTEXT</div><div class="viz-step-value">${escapeHTML(result.plaintext)}</div></div><div class="viz-step"><div class="viz-step-label">CIPHERTEXT</div><div class="viz-step-value">${escapeHTML(result.ciphertext)}</div></div></div></section>`;
        const meta=renderMeta(result);
        let special='';
        switch(family){
            case "aristocrat": case "patristocrat": case "xenocrypt": special=renderSubstitution(result,family); break;
            case "baconian": special=renderBaconian(result); break;
            case "fractionatedmorse": special=renderMorse(result); break;
            case "cryptarithm": special=renderCryptarithm(result); break;
            case "porta": special=renderPorta(result); break;
            case "nihilist": special=renderNihilist(result); break;
            case "columnar": special=renderColumnar(result); break;
            case "checkerboard": special=renderCheckerboard(result); break;
            case "homophonic": special=renderHomophonic(result); break;
        }
        return basic+meta+special;
    }

    function renderMeta(result){
        const rows=[];
        const p=result.parameters||{};
        const labels={keyType:"Key type",keyword:"Keyword",offset:"Offset",squareKeyword:"Polybius key",additiveKeyword:"Additive key",polybiusKeyword:"Polybius key",rowKeyword:"Row headers",columnKeyword:"Column headers",crib:"Crib",extractionDigits:"Extraction"};
        for(const [key,label] of Object.entries(labels)){
            if(p[key]!==undefined && p[key]!==null && p[key]!=="") rows.push([label,Array.isArray(p[key])?p[key].join("-"):p[key]]);
        }
        if(Array.isArray(p.key)) rows.push(["Column key",p.key.join("-")]);
        for(const info of result.challengeInfo||[]) rows.push([info.label,info.value]);
        if(!rows.length) return '';
        return `<section class="viz-card"><h2>Key information</h2><div class="viz-meta-grid">${rows.map(([a,b])=>`<div class="viz-meta"><div class="viz-meta-label">${escapeHTML(a)}</div><div class="viz-meta-value">${escapeHTML(b)}</div></div>`).join("")}</div></section>`;
    }

    function alphabetRow(text,spanish=false,accent=false){
        return `<div class="alphabet-row${spanish?' spanish':''}">${String(text||"").split("").map(ch=>`<div class="alphabet-cell${accent?' accent':''}">${escapeHTML(ch)}</div>`).join("")}</div>`;
    }

    function renderSubstitution(result,family){
        const p=result.parameters||{};
        const spanish=family==="xenocrypt";
        const alphabet=spanish?SPANISH:ENGLISH;
        const plain=p.plainAlphabet || alphabet;
        const cipher=p.cipherAlphabet || p.alphabet || alphabet;
        const note=family==="patristocrat"?"Original word spaces are removed before the ciphertext is regrouped for readability.":family==="xenocrypt"?"Spanish plaintext uses Ñ as a distinct alphabet letter.":"Visible word boundaries give Aristocrat solvers additional word-pattern clues.";
        return `<section class="viz-card"><h2>Substitution rows</h2><p style="color:var(--muted);line-height:1.6">${escapeHTML(note)}</p><div class="alphabet-wrap"><div class="viz-step-label">PLAIN ROW</div>${alphabetRow(plain,spanish)}<div class="viz-step-label" style="margin-top:10px">CIPHER ROW</div>${alphabetRow(cipher,spanish,true)}</div></section>`;
    }

    function renderBaconian(result){
        const pair=result.parameters?.symbolPair||["A","B"];
        return `<section class="viz-card"><h2>Five-symbol groups</h2><div class="viz-meta-grid"><div class="viz-meta"><div class="viz-meta-label">A CLASS</div><div class="viz-meta-value">${escapeHTML(pair[0])}</div></div><div class="viz-meta"><div class="viz-meta-label">B CLASS</div><div class="viz-meta-value">${escapeHTML(pair[1])}</div></div></div><h3>Read each block as one Baconian letter</h3><div class="viz-code strong">${escapeHTML(result.ciphertext)}</div></section>`;
    }

    function morseStream(text){
        const words=String(text||"").toUpperCase().match(/[A-Z]+/g)||[];
        return words.map(word=>word.split("").map(ch=>MORSE[ch]).join("x")).join("xx");
    }
    function renderMorse(result){
        let stream=morseStream(result.plaintext); while(stream.length%3) stream+='x';
        const groups=stream.match(/.{1,3}/g)||[];
        return `<section class="viz-card"><h2>Fractionation path</h2><div class="viz-steps"><div class="viz-step"><div class="viz-step-label">1 • MORSE STREAM</div><div class="viz-step-value">${escapeHTML(stream)}</div></div><div class="viz-step"><div class="viz-step-label">2 • TRIGRAMS</div><div class="viz-step-value">${escapeHTML(groups.join(' '))}</div></div><div class="viz-step"><div class="viz-step-label">3 • KEYED OUTPUT</div><div class="viz-step-value">${escapeHTML(result.ciphertext)}</div></div></div></section>`;
    }

    function renderCryptarithm(result){
        const entries=Object.entries(result.parameters?.letterToDigit||{}).sort((a,b)=>a[0].localeCompare(b[0]));
        return `<section class="viz-card"><h2>Arithmetic puzzle</h2><div class="viz-code strong">${escapeHTML(result.ciphertext)}</div><h3>Visualizer answer mapping</h3><div class="mapping-grid">${entries.map(([l,d])=>`<div class="mapping-row"><strong>${escapeHTML(l)}</strong> → ${escapeHTML(d)}</div>`).join("")}</div><p style="color:var(--muted);line-height:1.6">In Practice, this mapping is hidden. Use column arithmetic and carries to recover it before decoding the extraction.</p></section>`;
    }

    function repeatKey(text,key){
        const cleanKey=lettersOnly(key); let i=0; let out='';
        for(const ch of String(text||'').toUpperCase()){
            if(ENGLISH.includes(ch)){out+=cleanKey[i%cleanKey.length];i++;} else if(ch===' ') out+=' ';
        }
        return out;
    }
    function renderPorta(result){
        const key=result.parameters?.keyword||'';
        return `<section class="viz-card"><h2>Repeating key alignment</h2><div class="viz-steps"><div class="viz-step"><div class="viz-step-label">PLAINTEXT</div><div class="viz-step-value">${escapeHTML(result.plaintext)}</div></div><div class="viz-step"><div class="viz-step-label">REPEATING KEY</div><div class="viz-step-value">${escapeHTML(repeatKey(result.plaintext,key))}</div></div><div class="viz-step"><div class="viz-step-label">PORTA OUTPUT</div><div class="viz-step-value">${escapeHTML(result.ciphertext)}</div></div></div></section>`;
    }

    function renderPolybius(square,rowHeaders=['1','2','3','4','5'],colHeaders=['1','2','3','4','5']){
        let cells=`<div class="poly-cell header"></div>`+colHeaders.map(x=>`<div class="poly-cell header">${escapeHTML(x)}</div>`).join('');
        for(let r=0;r<5;r++){
            cells+=`<div class="poly-cell header">${escapeHTML(rowHeaders[r])}</div>`;
            for(let c=0;c<5;c++) cells+=`<div class="poly-cell">${escapeHTML(square.grid[r][c])}</div>`;
        }
        return `<div class="polybius">${cells}</div>`;
    }

    function renderNihilist(result){
        const p=result.parameters||{};
        const square=CipherEngine.codebusters.buildPolybiusSquare(p.squareKeyword||'CIPHER');
        return `<section class="viz-card"><h2>Keyed Polybius square</h2>${renderPolybius(square)}<h3>Additive stage</h3><div class="viz-code">PLAINTEXT → Polybius coordinates\nREPEATING KEY (${escapeHTML(p.additiveKeyword||'')}) → Polybius coordinates\nADD THE TWO VALUES → ${escapeHTML(result.ciphertext)}</div></section>`;
    }

    function renderColumnar(result){
        const key=result.parameters?.key||[];
        let text=lettersOnly(result.plaintext); while(key.length && text.length%key.length) text+='X';
        const rows=[]; for(let i=0;i<text.length;i+=key.length) rows.push(text.slice(i,i+key.length).split(''));
        const table=`<table class="viz-table"><thead><tr>${key.map(k=>`<th>${escapeHTML(k)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(ch=>`<td>${escapeHTML(ch)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
        return `<section class="viz-card"><h2>Complete rectangle</h2><div class="viz-table-wrap">${table}</div><p style="color:var(--muted);line-height:1.6">Read entire columns in numeric key order to form the ciphertext.</p></section>`;
    }

    function renderCheckerboard(result){
        const p=result.parameters||{};
        const square=CipherEngine.codebusters.buildPolybiusSquare(p.polybiusKeyword||'CIPHER');
        const row=lettersOnly(p.rowKeyword).slice(0,5).split('');
        const col=lettersOnly(p.columnKeyword).slice(0,5).split('');
        return `<section class="viz-card"><h2>Checkerboard coordinates</h2>${renderPolybius(square,row,col)}<h3>Output pairs</h3><div class="viz-code strong">${escapeHTML(result.ciphertext)}</div></section>`;
    }

    function renderHomophonic(result){
        const mapping=result.parameters?.mapping||{};
        return `<section class="viz-card"><h2>Plaintext → possible number symbols</h2><div class="mapping-grid">${Object.entries(mapping).map(([letter,tokens])=>`<div class="mapping-row"><strong>${escapeHTML(letter)}</strong> → ${escapeHTML(tokens.join(', '))}</div>`).join('')}</div><p style="color:var(--muted);line-height:1.6">A plaintext letter can have multiple number choices, but each number belongs to only one plaintext letter.</p></section>`;
    }

    document.addEventListener("DOMContentLoaded",init,{once:true});
})();
