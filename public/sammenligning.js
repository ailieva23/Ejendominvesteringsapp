import { beregnSimulering } from "./beregninger.js";
import { hentCasesDropdown } from "./genbrugFunktioner.js";

// Udviklet med AI-assistance (Claude, Anthropic, 2026).
// Linje 58-201.
// Koden er gennemgået og tilpasset af gruppen.
// I denne fil valgte vi at brug grafer til at vise de forskellige nøgletal, så hjemmesiden var mere brugervenlig og nemt at forstår.
// Derfor brugte vi hjælp fra Claude til at lave designet af graferne. 


// Gemmer graf referencer så de kan opdateres
let egenkapitalChart = null;
let cashflowChart = null;
let gaeldChart = null;


// Henter cases til begge dropdowns og genbruger hentCasesDropdown fra genbrugFunktioner.js
hentCasesDropdown('case1');
hentCasesDropdown('case2');


// Sammenligner to cases når brugeren klikker knappen
document.getElementById('sammenlignBtn').onclick = async () => {
    const case1Id = document.getElementById('case1').value;
    const case2Id = document.getElementById('case2').value;
    const periode = parseInt(document.getElementById('periode').value) || 30; // fallback til 30 år hvis periode er ugyldig.

    // Tjekker at mindst 2 forskellige cases er valgt. 
    if (!case1Id || !case2Id) {
        alert('Vælg begge investeringscases!');
        return;
    }

    if (case1Id === case2Id) {
        alert('Vælg to forskellige cases!');
        return;
    }

    try {
        // Henter data for begge cases fra databasen
        const response1 = await fetch(`/api/investeringscase/${case1Id}`);
        const response2 = await fetch(`/api/investeringscase/${case2Id}`);

        const data1 = await response1.json(); // laver svaret til JavaScript objekter. 
        const data2 = await response2.json();

        // Beregner simulering for begge cases ved at genbrug beregnSimulering fra beregninger.js
        const resultater1 = beregnSimulering(data1, periode);
        const resultater2 = beregnSimulering(data2, periode);

        // Viser sammenligningen som vi har defineret nedunder 
        visSammenligning(data1, data2, resultater1, resultater2);

    } catch (error) {
        console.log('Fejl ved sammenligning:', error);
    }
};

// Her er designet ved hjælp af Claude og opbygningen af alle 3 grafer er ens
// Viser sammenligning med grafer og tabel. 
function visSammenligning(data1, data2, resultater1, resultater2) {
    document.getElementById('resultater').style.display = 'block';

    const labels = resultater1.map(r => `År ${r.aar}`); // laver årstal på x aksen, fx år 1, år 2 osv. 
    const navn1 = data1.caseNavn || data1.adresse; // Navn på case 1
    const navn2 = data2.caseNavn || data2.adresse; // Navn på case 2

    // Sletter gamle grafer hvis der er nogen. 
    if (egenkapitalChart) egenkapitalChart.destroy();
    if (cashflowChart) cashflowChart.destroy();
    if (gaeldChart) gaeldChart.destroy();

    // Grafen til egenkapital
    egenkapitalChart = new Chart(document.getElementById('egenkapitalGraf').getContext('2d'), { // laver en 2d graf og gemmer det som egenkapitalChart
        type: 'line', // laver det til linje graf
        data: {
            labels: labels, // her er labels for x aksen
            datasets: [
                {
                    label: navn1,
                    data: resultater1.map(r => r.egenkapital), // egenkapitalen for hver år fra beregninger.js 
                    borderColor: 'green', // farven på linjen
                    tension: 0.3 // gør linjen let buet
                },
                {
                    label: navn2,
                    data: resultater2.map(r => r.egenkapital),
                    borderColor: 'blue',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true, // gør så grafen tilpasser sig skærmstørrelsen. 
            scales: {
                y: { ticks: { callback: v => v.toLocaleString('da-DK') + ' kr' } } // gør y aksen til dansk format for kroner. 
            }
        }
    });

    // Cashflow graf
    // Samme ting som den første graf
    cashflowChart = new Chart(document.getElementById('cashflowGraf').getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: navn1,
                    data: resultater1.map(r => r.cashflow),
                    borderColor: 'green',
                    tension: 0.3
                },
                {
                    label: navn2,
                    data: resultater2.map(r => r.cashflow),
                    borderColor: 'blue',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { ticks: { callback: v => v.toLocaleString('da-DK') + ' kr' } }
            }
        }
    });

    // Gæld graf
    // Samme ting som den første graf
    gaeldChart = new Chart(document.getElementById('gaeldGraf').getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: navn1,
                    data: resultater1.map(r => r.gaeld),
                    borderColor: 'green',
                    tension: 0.3
                },
                {
                    label: navn2,
                    data: resultater2.map(r => r.gaeld),
                    borderColor: 'blue',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { ticks: { callback: v => v.toLocaleString('da-DK') + ' kr' } }
            }
        }
    });

    // Bygger en HTML tabel og indsætter det i tabel elementet i html filen. 
    // Denne table er bare mest design af tabellen og så hvordan man sætter dataen vi allerede har ind i tabellen.
    // Her hentes det sidste år af arrayet som er det sidste år af perioden. 
    document.getElementById('tabel').innerHTML = `
        <h3>Sammenligningstabel — År ${resultater1.length}</h3> 
        <table border="1" style="border-collapse: collapse; width: 100%">
            <tr>
                <th>Nøgletal</th>
                <th>${navn1}</th>
                <th>${navn2}</th>
            </tr>

            <tr>
                <td>Egenkapital år ${resultater1.length}</td>
                <td>${resultater1[resultater1.length - 1].egenkapital.toLocaleString('da-DK')} kr</td>
                <td>${resultater2[resultater2.length - 1].egenkapital.toLocaleString('da-DK')} kr</td>
            </tr>

            <tr>
                <td>Cashflow år 1 (${data1.afdragsperiode > 0 ? 'afdragsfri' : 'med afdrag'})</td>
                <td style="color:${resultater1[0].cashflow >= 0 ? 'green' : 'red'}">
                    ${resultater1[0].cashflow.toLocaleString('da-DK')} kr
                </td>
                <td style="color:${resultater2[0].cashflow >= 0 ? 'green' : 'red'}">
                    ${resultater2[0].cashflow.toLocaleString('da-DK')} kr
                </td>
            </tr>

            <tr>
                <td>Cashflow år ${resultater1.length}</td>
                <td style="color:${resultater1[resultater1.length - 1].cashflow >= 0 ? 'green' : 'red'}">
                    ${resultater1[resultater1.length - 1].cashflow.toLocaleString('da-DK')} kr
                </td>
                <td style="color:${resultater2[resultater2.length - 1].cashflow >= 0 ? 'green' : 'red'}">
                    ${resultater2[resultater2.length - 1].cashflow.toLocaleString('da-DK')} kr
                </td>
            </tr>

            <tr>
                <td>Gæld år ${resultater1.length}</td>
                <td>${resultater1[resultater1.length - 1].gaeld.toLocaleString('da-DK')} kr</td>
                <td>${resultater2[resultater2.length - 1].gaeld.toLocaleString('da-DK')} kr</td>
            </tr>
        </table>
    `;
}