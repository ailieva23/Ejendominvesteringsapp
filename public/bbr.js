

// Vi har valgt at lave en separat bbrData funktion, fordi hentBBR() originalt lavede for mange ting på en gang(netværk, DOM, databehandling)
// Dette gjorde funktionen umulig at unitteste. Med den simpler og isoleret bbrData() funktion kan vi nemt bruge mock-data for at tjekke om output er korrekt. 

export function bbrData(data) { // Funktionen bruges til at strukturer dataen, ved at brug objekter, med læsbare navne.
    return {
        // vi skriver data[0], fordi BBR-serveren returnere et array af boligere, selvom vi søger via et unikt id, der giver os en enkelt adresse
        // vi bruger ?? "Ukendt", fordi hvis data[0] er null eller undefined, så bruger den "Ukendt" i stedet.
        // enh023 osv. er feltnavnet som BBR API'et bruger til den data vi ønsker at hente. 
        boligtype: data[0].enh023Boligtype ?? "Ukendt",
        // her bruger vi .byggeår i stedet, fordi i BBR API'et er der enhed, som er data om boligen og bygning, som er data om selve bygningen bl. a. byggeår
        byggeår: data[0].byggeår ?? "Ukendt",
        // her kan boligareal dataen hedde 2 forskellige ting i BBR API'et, derfor bruger vi || som bruger den første ikke tomme værdi.
        boligareal: data[0].enh027ArealTilBeboelse || data[0].enh028ArealTilErhverv || "Ukendt",
        antalVaerelser: data[0].enh031AntalVærelser ?? "Ukendt",
        grundareal: data[0].enh026EnhedensSamledeAreal ?? "Ukendt"
    };
}

// hentBBR() kaldes når brugeren søger en adresse via DAWA autocomplete.
// Funktionen er async, fordi den skal vente på svar fra serveren.
export async function hentBBR(adresseId) { // Formålet med funktionen er at hente data fra BBR API'et og vise det til brugeren.
    try { // vi bruger try {}, så vi undgår at koden crasher hvis der er fejl. 
        // Vi laver en variabel som bruger await fetch, fordi den skal vente indtil svaret er kommet før den fortsætter.
        const response = await fetch('/bbr', { // fetch til /bbr sender en request til vores server, hvor bbr_back.js modtager requesten. Derefter gemmes svaret som response
            method: 'POST', // Vi bruger HTTP metoden POST til at sende adresseId til serveren. 
            headers: { 'Content-Type': 'application/json' }, // Angiver at dataen skal være i JSON format
            body: JSON.stringify({ adresseId }) // Dataen konventeres til en JSON-streng, der indeholder adresseId. Den bliver konverteret til js objekt igen i bbr_back
        });

        const data = await response.json(); // Serverens svar konverteres fra JSON til et JavaScript-objekt, og gemmes som data.
        console.log("BBR data:", data); // Bare en test for at se, hvad der er modtaget af data

        // Formålet er at objekterne bliver selvsætndige variabler i resten af koden
        const { boligtype, byggeår, boligareal, antalVaerelser, grundareal } = bbrData(data); 
        console.log(boligtype, byggeår, boligareal, antalVaerelser, grundareal); // bare en test for at se dataen


        // Gemmer data som objekt, så den kan bruges til knappen. Den skal være INDE i try-blokken så gem-knappen kan se den
        const gemData = { // Denne data gemmes i databasen og vises til brugeren via ejendomsprofil.html
            adresse: document.getElementById('adresse').value, // Gemmer adressen, som brugeren skriver i inputfelt, de har id='adresse' i index.html
            ejendomstype: boligtype,
            byggeaar: parseInt(byggeår) || null, // parseInt konverterer byggeår til et tal, da databasen forventer et tal.
            boligareal: parseInt(boligareal) || null,
            antalVaerelser: parseInt(antalVaerelser) || null
        };

        // Vis gem-knappen vises først når BBR dataen er hentet
        document.getElementById('gemBtn').style.display = 'block';

        // Gem knap event - sender BBR data til serveren når brugeren klikker
        document.getElementById('gemBtn').onclick = async () => { // når man klikker knappen kører den async funktionen nedeunder
            try {
                const response = await fetch('/api/ejendom', { // Sender data til vores database i tabellen ejendom. 
                    method: 'POST', // HTTP metoden POST til at sende data til serveren.
                    headers: { 'Content-Type': 'application/json' }, // Angiver at dataen er i JSON format
                    body: JSON.stringify(gemData) // gemData sendes som en JSON-streng
                });
                const data = await response.json(); // Serverens svar konverteres fra JSON til et JavaScript objekt
                window.location.href = `/ejendomsprofil.html?${new URLSearchParams(gemData).toString()}`; // Sender os til ejendomsprofil.html og sender bbrData som URL parametre
            } catch (error) {
                console.log("Fejl ved gem:", error); // Logger fejl hvis gem mislykkes
            }
        };

    } catch (error) {
        console.log("Fejl:", error); // Logger fejl hvis BBR data ikke kan hentes
    }
}


// Vi skrev kun module.exports = { bbrData }, men det virkede ikke til Jest testen, så vi brugte Claude til at løse problemet og den gav os denne kode. 
// Uden denne kode, får vi ReferenceError i browseren, da browseren prøver at kører module.exports koden og crasher. 
// module er et object i node.js og Jest, men i browseren er det undefined.
// Derfor hvis module er objekt, så kører den koden, og hvis den er undefined, så springes den over. 
if (typeof module !== 'undefined') module.exports = { bbrData }; // exportere funktionen, så den kan bruges til Jest test.
