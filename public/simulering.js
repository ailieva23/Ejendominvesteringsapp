import { hentCasesDropdown } from "./genbrugFunktioner.js";
import { beregnSimulering } from "./beregninger.js";

// Genbruger hentCasesDropdown fra genbrugFunktioner.js som udfylder drop down menuen med alle gemte investeringscases. 
hentCasesDropdown('caseValg');

// Når man trykker på simulerings knappen, så kører den denne funktion.
document.getElementById('simuleringBtn').onclick = async () => {
    const caseId = document.getElementById('caseValg').value; // henter den valgte case
    const periode = parseInt(document.getElementById('periode').value) || 30; // laver den valgte periode om til et tal, og hvis værdien er ugyldig, så bruger den 30 år.

    // hvis man trykker på knappen før man har valgt case, så viser hjemmesiden denne warning.
    if (!caseId) {
        alert('Vælg en investeringscase først!');
        return;
    }

    try {
        const response = await fetch(`/api/investeringscase/${caseId}`); // ellers bliver den specifik case hentet fra databasen.
        const data = await response.json(); // svaret konverteres til JavaScript objekt

        // genbruger beregnSimulering() funktionen, så der beregner nøgletal for case ud fra data og periode.
        const resultater = beregnSimulering(data, periode);
        visResultater(data, resultater); // derefter vises resultaterne med funktionen der bliver defineret nedunder.
    } catch (error) {
        console.log('Fejl ved simulering:', error);
    }
};


// Udviklet med AI-assistance (Claude, Anthropic, 2026).
// Linje 33-106.
// Koden er gennemgået og tilpasset af gruppen.
// Her brugte vi samme kode for at lave en graf ligesom i sammenligning.js, som blev også forklaret der.

let chart = null;

function visResultater(data, resultater) {
    document.getElementById('resultater').style.display = 'block';
    document.getElementById('caseNavn').textContent = data.caseNavn || data.adresse;

    const labels = resultater.map(r => `År ${r.aar}`); // år der er på x aksen.
    const egenkapital = resultater.map(r => r.egenkapital); 
    const cashflow = resultater.map(r => r.cashflow);
    const gaeld = resultater.map(r => r.gaeld);

    if (chart) chart.destroy();

    const ctx = document.getElementById('simuleringGraf').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Egenkapital (kr)',
                    data: egenkapital,
                    borderColor: 'green',
                    tension: 0.3
                },
                {
                    label: 'Cashflow (kr)',
                    data: cashflow,
                    borderColor: 'blue',
                    tension: 0.3
                },
                {
                    label: 'Gæld (kr)',
                    data: gaeld,
                    borderColor: 'red',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    ticks: {
                        callback: value =>
                            value.toLocaleString('da-DK') + ' kr'
                    }
                }
            }
        }
    });

    document.getElementById('tabel').innerHTML = `
        <h3>Nøgletal</h3>
        <table border="1" style="border-collapse:collapse;width:100%">
            <tr>
                <th>År</th>
                <th>Egenkapital</th>
                <th>Cashflow</th>
                <th>Gæld</th>
            </tr>
            ${resultater.map(r => `
                <tr>
                    <td>${r.aar}</td>
                    <td>${r.egenkapital.toLocaleString('da-DK')} kr</td>
                    <td style="color:${r.cashflow >= 0 ? 'green' : 'red'}">
                        ${r.cashflow.toLocaleString('da-DK')} kr
                    </td>
                    <td>${r.gaeld.toLocaleString('da-DK')} kr</td>
                </tr>
            `).join('')}
        </table>
    `;
}