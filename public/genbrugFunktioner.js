// Vi oprettede denne fil så vi kan genbruge funktionerne i stedet for at skrive logikken for funktionerne hver gang vi ville bruge dem.

// Udviklet med AI-assistance (Claude, Anthropic, 2026).
// Linje 11 - 15.
// Koden er gennemgået og tilpasset af gruppen.
// Vi havde problemer med gemme datoen for ejendomprofilerne og investeringscasen.
// Vi fik hjælp ti det fra Claude, og det skyldes at når vi indtaster dato i hjemmesiden, så forstår databasen ikke JavaScripts datoformat.
// Denne måde kan databasen ikke håndtere og vi fik fejl. Derfor vi bruger formaterDato til at lave det til dag-måned-år

// Denne funktion bruges når dato skal vises til brugeren
export const formaterDato = function (dato) {
    // Formaterer dato til dansk format og returnerer 'Ikke angivet' hvis dato mangler.
    return dato ? new Date(dato).toLocaleDateString('da-DK') : 'Ikke angivet';
}
// window.formaterDato = formaterDato // gør funktionen globalt, så den kan bruges i andre js filer.

// Bruges når man udfylder dato i inputfeltet, med formålet at lave det til en form som databasen kan forstår og gemme. 
export const formaterDatoISO = function (dato) {
    // Formaterer dato til år-måned-dag format til brug i input felter
    return dato ? new Date(dato).toISOString().split('T')[0] : '';
}
// window.formaterDatoISO = formaterDatoISO // gør funktionen globalt, så den kan bruges i andre js filer.


// Udviklet med AI-assistance (Claude, Anthropic, 2026).
// Linje 31 - 51.
// Koden er gennemgået og tilpasset af gruppen.
// Vi fik hjælp med hvordan man gemmer og viser de cases vi har så vi fik hjælp, med at lave .forEach rigtigt. 

// Denne funktion bruges til de drop down menuer vi bruger til at vælge hvilke investeringscases man vil simulere og sammenligne
export const hentCasesDropdown = async function (selectId) {
    try {
        const response = await fetch('/api/investeringscase'); // henter alle investeringscases
        const cases = await response.json(); // Konverter fra json til JavaScript objekt. 

        const select = document.getElementById(selectId); // finder den dropdown element, som sendes via argumentet. Det er id'en for elementet fra htmlen. 
        select.innerHTML = '<option value="">-- Vælg en case --</option>'; // bare en besked hvor de skal vælge case

        // løkke der gennemgår hver case og opretter option element for hver i htmlen. (kunne også have brugt for loop)
        cases.forEach(c => {
            const option = document.createElement('option');
            option.value = c.idInvesteringscase; // gemmer casens id som .value til option variablen. Det bruges til at ved hvilken case brugeren har valgt. 
            option.textContent = `${c.adresse}${c.caseNavn ? ' - ' + c.caseNavn : ''}`; // Viser adressen og case navnet i dropdown elementet.
            // vises kun adresse hvis der ikke er caseNavn. 
            select.appendChild(option); // tilføjer option elementet til dropdown lsiten. 
        });
    } catch (error) {
        console.log('Fejl ved hentning af cases til dropdown:', error);
    }
}
// window.hentCasesDropdown = hentCasesDropdown // gør funktionen globalt, så den kan bruges i andre js filer.


// Udviklet med AI-assistance (Claude, Anthropic, 2026).
// Linje 59-81.
// Koden er gennemgået og tilpasset af gruppen.
// Vi fik hjælp med logikken for hvordan vi håndtere om casen skal redigeres eller duplikeres, samt at brug formaterDatoISO. 

export const byggCaseUrlParams = function (data, erRediger = false) { // funktionen er false, dvs. duplikering, til at start hvis man ikke angiver andet. 
    // Bygger URL parametre fra case data — bruges til rediger og dupliker
    return new URLSearchParams({
        ...(erRediger && { id: data.idInvesteringscase, rediger: true }), // tilføjer kun id og rediger hvis rediger er true, ellers ikke. 
        adresse: data.adresse || '', // fallbacks så koden kører hvis undefined. 
        ejendomspris: data.pris || '',
        laanebeloeb: data.laanebeloeb || '',
        rente: data.rente || '',
        loebetid: data.loebetid || '',
        afdragsperiode: data.afdragsperiode || '',
        laantype: data.laantype || '',
        renoveringUdgifter: data.renoveringUdgifter || '',
        renoveringTidspunkt: formaterDatoISO(data.renoveringTidspunkt), // genbruger formaterDatoISO
        vedligeholdelse: data.vedligeholdelse || '',
        forsikring: data.forsikring || '',
        maanedligLeje: data.lejeindtaegt || '',
        udlejningsudgifter: data.udlejningsudgifter || '',
        caseNavn: erRediger ? (data.caseNavn || '') : (data.caseNavn ? `Kopi af ${data.caseNavn}` : 'Kopi'),
        caseBeskrivelse: data.caseBeskrivelse || '',
        advokat: data.advokat || '',
        tinglysning: data.tinglysning || '',
        koberraadgivning: data.koberraadgivning || ''
    }).toString();
}
// window.byggCaseUrlParams = byggCaseUrlParams // gør funktionen globalt, så den kan bruges i andre js filer.

// genbruges i ejendomsprofiler.js og caseOversigt.js
export const navigerTilCase = function (urlParams) {
    // Sender brugeren til investeringscase med URL med data om casen.
    window.location.href = `/investeringscase.html?${urlParams}`;
}
// window.navigerTilCase = navigerTilCase // gør funktionen globalt, så den kan bruges i andre js filer.


if (typeof module !== 'undefined') module.exports = { byggCaseUrlParams }; // til jest, som forklaret før, ville browseren crashe, da module ikke findes. 