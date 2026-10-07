// henter dataen fra URL'en der blev sendt fra ejendomsprofiler.js eller caseOversigt.js
const params = new URLSearchParams(window.location.search);
document.getElementById('ejendomsAdresse').textContent = `Ejendom: ${params.get('adresse')}`;

// Tjekker om vi er i redigeringstilstand
const erRediger = params.get('rediger') === 'true'; // sætter rediger til true, så vi kan rediger casen. 
const caseId = params.get('id'); // gemmer case id til PUT requesten senere.

// gør så dataen gemmes hvis brugeren vil redigerer eller duplikerer investeringscase.
document.getElementById('caseNavn').value = params.get('caseNavn') || '';
document.getElementById('caseBeskrivelse').value = params.get('caseBeskrivelse') || '';
document.getElementById('ejendomspris').value = params.get('ejendomspris') || '';
document.getElementById('advokat').value = params.get('advokat') || '';
document.getElementById('tinglysning').value = params.get('tinglysning') || '';
document.getElementById('koberraadgivning').value = params.get('koberraadgivning') || '';
document.getElementById('laanebeloeb').value = params.get('laanebeloeb') || '';
document.getElementById('rente').value = params.get('rente') || '';
document.getElementById('loebetid').value = params.get('loebetid') || '';
document.getElementById('afdragsperiode').value = params.get('afdragsperiode') || '';
document.getElementById('laantype').value = params.get('laantype') || '';
document.getElementById('renoveringUdgifter').value = params.get('renoveringUdgifter') || '';
document.getElementById('renoveringTidspunkt').value = params.get('renoveringTidspunkt') || '';
document.getElementById('vedligeholdelse').value = params.get('vedligeholdelse') || '';
document.getElementById('forsikring').value = params.get('forsikring') || '';
document.getElementById('maanedligLeje').value = params.get('maanedligLeje') || '';
document.getElementById('udlejningsudgifter').value = params.get('udlejningsudgifter') || '';
document.getElementById('gemCaseBtn').textContent = 'Opdater investeringscase';

// Hvis erRediger er true, så udfylder vi felterne med den gemte data. 

// Det bruges bare til at skrifte mellem siderne fot Køb og omkostninger, Finansiering, Renovering, Drift og Udlejning. 
document.getElementById('side1Næste').onclick = () => skiftSide('side1', 'side2');
document.getElementById('side2Tilbage').onclick = () => skiftSide('side2', 'side1');
document.getElementById('side2Næste').onclick = () => skiftSide('side2', 'side3');
document.getElementById('side3Tilbage').onclick = () => skiftSide('side3', 'side2');
document.getElementById('side3Næste').onclick = () => skiftSide('side3', 'side4');
document.getElementById('side4Tilbage').onclick = () => skiftSide('side4', 'side3');
document.getElementById('side4Næste').onclick = () => skiftSide('side4', 'side5');
document.getElementById('side5Tilbage').onclick = () => skiftSide('side5', 'side4');

// Funktion der skjuler én side og viser en anden
function skiftSide(fraId, tilId) {
    document.getElementById(fraId).style.display = 'none'; // Skjuler nuværende side
    document.getElementById(tilId).style.display = 'block'; // Viser næste side
}

// Laver alle værdier der skal være tal til tal så de kan gemmes i databasen.
document.getElementById('gemCaseBtn').onclick = async () => {
    const caseData = {
        adresse: params.get('adresse'),
        caseNavn: document.getElementById('caseNavn').value,
        caseBeskrivelse: document.getElementById('caseBeskrivelse').value,
        ejendomspris: parseInt(document.getElementById('ejendomspris').value) || null,
        advokat: parseInt(document.getElementById('advokat').value) || null,
        tinglysning: parseInt(document.getElementById('tinglysning').value) || null,
        koberraadgivning: parseInt(document.getElementById('koberraadgivning').value) || null,
        laanebeloeb: parseInt(document.getElementById('laanebeloeb').value) || null,
        rente: parseFloat(document.getElementById('rente').value) || null,
        loebetid: parseInt(document.getElementById('loebetid').value) || null,
        afdragsperiode: parseInt(document.getElementById('afdragsperiode').value) || null,
        laantype: document.getElementById('laantype').value || null,
        renoveringUdgifter: parseInt(document.getElementById('renoveringUdgifter').value) || null,
        renoveringTidspunkt: document.getElementById('renoveringTidspunkt').value || null,
        vedligeholdelse: parseInt(document.getElementById('vedligeholdelse').value) || null,
        forsikring: parseInt(document.getElementById('forsikring').value) || null,
        maanedligLeje: parseInt(document.getElementById('maanedligLeje').value) || null,
        udlejningsudgifter: parseInt(document.getElementById('udlejningsudgifter').value) || null
    };

    try {
        // Bruger PUT hvis vi redigerer, POST hvis vi opretter ny
        const url = erRediger
            ? `/api/investeringscase/${caseId}` // PUT til opdatering
            : '/api/investeringscase'; // POST til ny case
        const method = erRediger ? 'PUT' : 'POST'; // PUT opdaterer, POST opretter ny

        const response = await fetch(url, {
            method: method, // bruger PUT eller POST an på om erRediger er true eller false
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(caseData)
        });
        const data = await response.json(); // gemmer svaret fra serveren.
        alert(data.message); // Viser "Investeringscase gemt!" eller "Opdateret!"
        window.location.href = 'index.html'; // Redirect til startside
    } catch (error) {
        console.log("Fejl ved gem:", error);
    }
};