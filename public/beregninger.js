// Udviklet med AI-assistance (Claude, Anthropic, 2026).
// Linje 54-57.
// Koden er gennemgået og tilpasset af gruppen.
// Her brugte vil Claude til at hjælpe os med den svær beregning af rente delen for den faste ydelse.
// Denne beregning var alt for compliceret for os at finde ud af selv. 

export function beregnSimulering(data, periode) {
    console.log("Afdragsfri år fra DB:", data.afdragsperiode); // bare en console log vi brugte til at fange en fejl med henting af data
    const resultater = []; // tomt array vi pusher resultaterne ind i senere

    // her henter vi data og gemmer den i de forskellige variabler
    const ejendomspris = data.pris || 0; // fallbacks hvis data ikke er gyldig.
    const laanebeloeb = data.laanebeloeb || 0;
    const rente = (data.rente || 0) / 100; // dividerer med 100 for at får det i procent.
    const loebetid = data.loebetid || 30;
    const afdragsfriAar = data.afdragsperiode || 0;

    const vedligeholdelse = (data.vedligeholdelse || 0) / 12; // denne værdi er pr. år., så vi laver det om til pr. måned.
    const forsikring = (data.forsikring || 0) / 12; // samme her
    const lejeindtaegt = data.lejeindtaegt || 0;
    const udlejningsudgifter = data.udlejningsudgifter || 0;

    const maanedligRente = rente / 12; // finder hvad den månedlige rente er, da vi vil finde ydelse pr måned.

    let restgaeld = laanebeloeb; // restgælden starter med at være 100% af lånebeløbet
    let ejendomsvaerdi = ejendomspris; // ejendomsværdien er prisen til at start, da vi siger at boligen stiger med 2% pr år.

    // Her regner vi først på hvis der er afdragsfri ydelse, dvs. der betales kun renter.
    const ydelseAfdragsfri = laanebeloeb * maanedligRente; // her siger vi lånebeløbet gange renterne, da vi kun betaler renter til at start.

    let ydelseEfter = 0; // Ydelsen når afdragsfrihed slutter

    // Den første for loop kører pr antal år.
    for (let aar = 1; aar <= periode; aar++) { // periode er hvor mange år simuleringen skal være (30 år ifølge opgaven, men kan justeres) 
        // Denne for loop kører pr antal måneder.
        for (let maaned = 1; maaned <= 12; maaned++) {

            if (restgaeld > 0) { // tjekker om restgælden er større end 0. (Den er ikke særligt nødvendig, men har den for at være sikker)

                if (aar <= afdragsfriAar) { // Denne if tjekker om den nuværende år er mindre eller lige med afdragsfriår. Den tjekkes hver loop
                    // finder vi ud af hvad rente delen af ydelsen er, da der er afdragsfrihed.
                    const renteDel = restgaeld * maanedligRente;


                } else {

                    // Når der ikke er afdragsfrihed mere, finder vi både rente og afdragsdelen.
                    // Vi ved at restgælden stadig er det samme, men vi har bare færre måneder til at betale den. 
                    if (aar === afdragsfriAar + 1 && maaned === 1) {
                        // første step er at finde ud af hvor mange måneder der er tilbage i perioden.
                        const resterendeMaaneder = (loebetid - afdragsfriAar) * 12;

                        // her kommer den kompliceret del som vi brugte hjælp fra Claude til. 
                        ydelseEfter = restgaeld * //svaret fra brøken nedunder ganges med restgælden til at finde den månedlige ydelse.
                            (maanedligRente * Math.pow(1 + maanedligRente, resterendeMaaneder)) / // Math.pow er en beregning renters rente.
                            (Math.pow(1 + maanedligRente, resterendeMaaneder) - 1); // denne bruges til at beregne renten så den passer præcis til den resterende løbetid. 
                    }

                    // Normal betaling
                    const renteDel = restgaeld * maanedligRente; // her finder vi af hvad rente delen af ydelsen er
                    const afdragDel = ydelseEfter - renteDel; // og her hvad afdragsdelen er 

                    restgaeld = restgaeld - afdragDel; // her opdaterer vi restgælden ved at trække afdrag fra hver måned.
                }
            }
        }

        // Her ganges ejendomsværdien med 2% hver år af perioden, da den er ind i den første for loop
        ejendomsvaerdi *= 1.02;

        let aktuelYdelse = 0; // laver en aktual ydelse variable

        if (aar <= afdragsfriAar) {
            aktuelYdelse = ydelseAfdragsfri; // Hvis der er afdragsfrihed, så sættes ydelsen til den afdragsfri ydelse. 
        } else {
            aktuelYdelse = ydelseEfter // ellers sættes den til den fylde ydelse med renter og afdrag.
        }

        // her beregner vi cash flowet, som er bare indtægter - omkostninger pr måned. Cash flowet vises pr år og ikke pr måned
        const cashflow =
            (lejeindtaegt * 12) // her finder vi indtægter pr år.
            - (vedligeholdelse + forsikring + udlejningsudgifter) * 12 // Her finder vi omkostninger ved boligen pr år
            - (aktuelYdelse * 12); // Og omkostninger for lånet. Begge omkostninger trækkes fra indtægterne.

        resultater.push({ // Her pusher vi alle resultater i arrayet
            aar: aar,
            egenkapital: Math.round(ejendomsvaerdi - restgaeld), // Vi bruger math round til at runde op hvis der er dicimaler. 
            cashflow: Math.round(cashflow),
            gaeld: Math.round(restgaeld)
        });
    }

    return resultater;
};

// Udviklet med AI-assistance (Claude, Anthropic, 2026).
// Linje 103.
// Koden er gennemgået og tilpasset af gruppen.
// Vi skrev kun module.exports = { bbrData }, men det virkede ikke til Jest testen, så vi brugte Claude til at løse problemet og den gav os denne kode. 
// Uden denne kode, får vi ReferenceError i browseren, da browseren prøver at kører module.exports koden og crasher. 
// module er et object i node.js og Jest, men i browseren er det undefined.
// Derfor hvis module er objekt, så kører den koden, og hvis den er undefined, så springes den over. 
if (typeof module !== 'undefined') module.exports = { beregnSimulering };