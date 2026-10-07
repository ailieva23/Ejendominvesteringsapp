import { hentBBR, bbrData } from "./bbr.js";


// Henter ejendomsdata fra URL parametrene som blev sendt fra index.html
const params = new URLSearchParams(window.location.search); // window.location.search henter URL fra gemData fra hentBBR funktionen, derefter vises dataen nedunder

// Bruges bare til at finde dataen vi hentede fra BBR API'et til brugeren.
document.getElementById('adresse').textContent = params.get('adresse');
document.getElementById('boligtype').textContent = params.get('ejendomstype');
document.getElementById('byggeaar').textContent = params.get('byggeaar');
document.getElementById('boligareal').textContent = params.get('boligareal');
document.getElementById('antalVaerelser').textContent = params.get('antalVaerelser');


document.getElementById('opretCaseBtn').onclick = () => { // bruger vi opret knappen til blive sendt til en andet side, hvor vi får lov til at skrive investeringscasen.
    const urlParams = new URLSearchParams({ // gemmer alt data om boligeren vi har fra URL, så dataen kan sende videre med brugeren senere.
        adresse: params.get('adresse'),
        ejendomstype: params.get('ejendomstype'),
        byggeaar: params.get('byggeaar'),
        boligareal: params.get('boligareal'),
        antalVaerelser: params.get('antalVaerelser')
    }).toString(); // .toString() laver objektet til en URL igen, så vi kan brug det om lidt. 

    window.location.href = `/investeringscase.html?${urlParams}`; // her sender vi brugeren til investeringscase.html med urlParams dataen som URL. 
    // Det gøres, så vi holder styr på hvilken ejendom denne investeringscase tilhører. 
};

// Tidligere var det muligt at trykke på opret case før man har gemt ejendommen, så ødelægge koden senere, derfor har vi slukket for knappen indtil ejendommen gemmes.
document.getElementById('opretCaseBtn').disabled = true; // Knappen er deaktiveret til at start, indtil der bliver trykker på gem ejendomsprofil knappen. 
// Gem ejendomsprofil knap
document.getElementById('gemProfilBtn').onclick = async () => {
    try {
        const response = await fetch('/api/ejendomsprofil', { // Sender HTTP POST til databasen
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ // det er dataen der gemmes i databasen. 
                adresse: params.get('adresse'),
                ejendomstype: params.get('ejendomstype'),
                byggeaar: params.get('byggeaar'),
                boligareal: params.get('boligareal'),
                antalVaerelser: params.get('antalVaerelser')
            })
        });
        const data = await response.json(); // bruges til at gemme svaret fra serveren, og bruges derefter til at vise beskeden til brugeren.
        alert(data.message); // Viser "Ejendomsprofil gemt!"

        document.getElementById('opretCaseBtn').disabled = false; // her aktiveres knappen igen. 

    } catch (error) {
        console.log('Fejl ved gem af ejendomsprofil:', error);
    }
};
