require("dotenv").config(); // loader .env filen så vi kan bruge dem i koden

const express = require('express');
const router = express.Router();


const bbrBaseURL = 'https://services.datafordeler.dk/BBR/BBRPublic/1/rest'; // gemmer linket til BBR API'et
const bbrUsername = process.env.bbrBrugernavn; // henter brugernavn fra .env, så den ikke er synlig i koden.
const bbrPassword = process.env.bbrAdgangskode; // henter adgangskoden fra .env

// Modtager POST request fra hentBBR() i index.js med id fra DAWA
router.post('/bbr', async function (req, res) {
    const adresseId = req.body?.adresseId; // henter adresseId fra requesten

    // tjekker om adresseId er modtaget, ellers sender fejl.
    if (!adresseId) {
        res.status(400).json({ error: 'adresseId is required' });
        return;
    }

    try { // henter enhedsdata fra BBR API'et
        const enhedUrl = new URL(`${bbrBaseURL}/enhed`);
        enhedUrl.searchParams.set("AdresseIdentificerer", adresseId); // søger adresseId
        enhedUrl.searchParams.set("username", bbrUsername); // dette bruges til at log ind i BBR API'et
        enhedUrl.searchParams.set("password", bbrPassword);

        const enhedResponse = await fetch(enhedUrl); // sender request til BBR API'et
        const enhedData = await enhedResponse.json(); // konverterer svaret til JavaScript objekter.

        const bygningId = enhedData[0]?.bygning; // henter bygningsId fra enhedsdata, så vi kan finde byggeår.

        let byggeår = "Ukendt"; // bare en fallback hvis bygningsId ikke findes

        if (bygningId) { // Nu henter bygningsdata fra BBR API'et på samme måde, fordi byggeår er ikke inkluderet i enhedsdata
            const bygningUrl = new URL(`${bbrBaseURL}/bygning`);
            bygningUrl.searchParams.set("id", bygningId);
            bygningUrl.searchParams.set("username", bbrUsername);
            bygningUrl.searchParams.set("password", bbrPassword);

            const bygningResponse = await fetch(bygningUrl);
            const bygningData = await bygningResponse.json();
            byggeår = bygningData[0]?.byg026Opførelsesår ?? "Ukendt"; // henter byggeår og der er fallback til "Ukendt" hvis den mangler.
        }

        enhedData[0].byggeår = byggeår // tilføjer byggeår til enhedsdata.
        res.json(enhedData); // sender det samlet data til hentBBR() funktionen i index.js

    } catch (err) {
        console.error("BBR fejl:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; // exporterer router så den kan bruges i app.js

