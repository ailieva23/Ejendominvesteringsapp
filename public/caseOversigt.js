import { formaterDato, navigerTilCase, byggCaseUrlParams } from "./genbrugFunktioner.js";

// Henter alle investeringscases fra databasen når siden loader
async function hentCases() {
    try {
        const response = await fetch('/api/investeringscase'); // Henter data om investeringscase fra databasen.
        const cases = await response.json();
        console.log(cases) // for at se hvad API returnere
        const container = document.getElementById('casesList');

        // Viser besked hvis der ikke er nogen cases endnu
        if (cases.length === 0) {
            container.innerHTML = '<p>Der er ingen investeringscases endnu.</p>'; // beskeden der vises
            return;
        }


        container.innerHTML = cases.map(c => `
            <div class="case-kort">
                <h2>${c.adresse}</h2>
                <p><b>Pris:</b> ${c.pris ? c.pris.toLocaleString('da-DK') + ' kr' : 'Ikke angivet'}</p>
                <p><b>Omkostninger:</b> ${c.omkostninger ? c.omkostninger.toLocaleString('da-DK') + ' kr' : 'Ikke angivet'}</p>
                <p><b>Byggeår:</b> ${c.byggeaar}</p>
                <p><b>Boligareal:</b> ${c.boligareal} m²</p>
                <p><b>Oprettet:</b> ${formaterDato(c.oprettelsesdato)}</p>
                <button class="rediger-btn" data-id="${c.idInvesteringscase}">Rediger</button>
                <button class="slet-btn" data-id="${c.idInvesteringscase}">Slet</button>
                <button class="dupliker-btn" data-id="${c.idInvesteringscase}">Dupliker</button>
            </div>
        `).join('');

        // dette bruges til eventlistener i stedet for onclick, fordi ellers kan vi ikke brug redigerCase() funktionen
        container.querySelectorAll('.rediger-btn').forEach(btn =>
            btn.addEventListener('click', () => redigerCase(btn.dataset.id)));
        container.querySelectorAll('.slet-btn').forEach(btn =>
            btn.addEventListener('click', () => sletCase(btn.dataset.id)));
        container.querySelectorAll('.dupliker-btn').forEach(btn =>
            btn.addEventListener('click', () => duplikerCase(btn.dataset.id)));

    } catch (error) {
        console.log('Fejl ved hentning af cases:', error);
    }
}

hentCases(); // Kører funktionen når siden loader

// Sletter en investeringscase
async function sletCase(id) {
    if (!confirm('Er du sikker på at du vil slette denne investeringscase?')) return; // bare en besked der spørger brugeren om de er sikker på de vil slette casen. 

    try {
        const response = await fetch(`/api/investeringscase/${id}`, {
            method: 'DELETE' // HTTP metoden DELETE bruges til at slette dataen fra databasen
        });
        const data = await response.json(); // vi venter på svar tilbage fra serveren, som vi sender til brugeren bagefter
        alert(data.message); // Viser "Investeringscase slettet!"
        hentCases(); // Opdaterer listen efter sletning
    } catch (error) {
        console.log('Fejl ved sletning:', error);
    }
}

// Funktion der tillader brugeren at redigere en case, men den gamle data stadig der. 
async function redigerCase(id) {
    try {
        const response = await fetch(`/api/investeringscase/${id}`); // først henter vi den specifikke case ud fra id'et fra databasen. 
        const data = await response.json(); // laver det om til json
        // Genbruger byggCaseUrlParams og navigerTilCase fra genbrugFunktioner.js
        // navigerTilCase sender bare brugeren til investeringscase.html baseret på URL'en, som vi får fra byggCaseUrlParams.
        // Den konverter dataen til en URL, og vi har sat det til true, da vi ønsker at redigere casen og ikke duplikere den.
        navigerTilCase(byggCaseUrlParams(data, true));
    } catch (error) {
        console.log('Fejl ved hentning af case:', error);
    }
}

// Duplikerer en investeringscase
// Næsten alt er det samme som redigerCase
async function duplikerCase(id) {
    try {
        const response = await fetch(`/api/investeringscase/${id}`);
        const data = await response.json();
        // Genbruger byggCaseUrlParams og navigerTilCase fra genbrugFunktioner.js
        navigerTilCase(byggCaseUrlParams(data, false)); // det eneste er at her har vi false, som betyder at casen bliver duplikeret.
    } catch (error) {
        console.log('Fejl ved duplikering:', error);
    }
}