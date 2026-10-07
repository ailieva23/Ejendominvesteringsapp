import { navigerTilCase } from "./genbrugFunktioner.js";

// Henter alle ejendomsprofiler fra databasen når siden loader
async function hentProfiler() {
    try {
        const response = await fetch('/api/ejendomsprofil'); // Henter alle profiler fra databasen
        const profiler = await response.json(); // Konverterer serverens svar til JavaScript objekt. 

        const container = document.getElementById('profilerListe'); // Finder div fra htmlen og gemmer det i scripen, så data kan sender dertil

        // Viser besked hvis der ikke er nogen profiler endnu
        if (profiler.length === 0) {
            container.innerHTML = '<p>Der er ingen ejendomsprofiler endnu.</p>'; // sender denne besked
            return;
        }


        // Viser alle profiler
        // profiler.map samler dataen om profilerne og sender det til container som vi definerede tidligere.
        // For oprettet dato, tjekkes der først om der er dato, og hvis ikke siger den ikke angivet.  
        container.innerHTML = profiler.map(p => ` 
            <div class="case-kort">
                <h2>${p.adresse}</h2>
                <p><b>Byggeår:</b> ${p.byggeaar}</p>
                <p><b>Boligareal:</b> ${p.boligareal} m²</p>
                <p><b>Antal værelser:</b> ${p.antalVaerelser}</p>
                <p><b>Oprettet:</b> ${p.oprettetDato ? new Date(p.oprettetDato).toLocaleDateString('da-DK') : 'Ikke angivet'}</p> 
                <p><b>Antal investeringscases:</b> ${p.antalCases}</p>
                <button class="opret-btn" 
                    data-adresse="${p.adresse}" 
                    data-ejendomstype="${p.ejendomstype}" 
                    data-byggeaar="${p.byggeaar}" 
                    data-boligareal="${p.boligareal}" 
                    data-antalvaerelser="${p.antalVaerelser}">Opret investeringscase</button>
                <button class="slet-btn" data-id="${p.idEjendomsprofil}">Slet</button>
            </div>
        `).join('');

        container.querySelectorAll('.slet-btn').forEach(btn =>
            btn.addEventListener('click', () => sletProfil(btn.dataset.id)));

        container.querySelectorAll('.opret-btn').forEach(btn =>
            btn.addEventListener('click', () => opretCase(
                btn.dataset.adresse,
                btn.dataset.ejendomstype,
                btn.dataset.byggeaar,
                btn.dataset.boligareal,
                btn.dataset.antalvaerelser
            )));

    } catch (error) {
        console.log('Fejl ved hentning af profiler:', error);
    }
}

hentProfiler(); // Kører funktionen når siden loader

// Sletter en ejendomsprofil
async function sletProfil(id) {
    try {
        const response = await fetch(`/api/ejendomsprofil/${id}`, { // henter data for den specifikke id
            method: 'DELETE' // DELETE bruges til at slette dataen
        });
        const data = await response.json(); // gemmer svaret fra serveren, som bruger til at vise det til brugeren
        alert(data.message); // Viser "Ejendomsprofil slettet!"
        hentProfiler(); // Opdaterer listen efter sletning
    } catch (error) {
        console.log('Fejl ved sletning:', error);
    }
}


// Sender brugeren til investeringscase siden, hvor de kan indtaste oplysninger om casen
function opretCase(adresse, ejendomstype, byggeaar, boligareal, antalVaerelser) {
    const urlParams = new URLSearchParams({
        adresse, ejendomstype, byggeaar, boligareal, antalVaerelser
    }).toString();
    navigerTilCase(urlParams); // vi bruger navigerTilCase med URL, som indeholder dataen, til næste side. 
}
