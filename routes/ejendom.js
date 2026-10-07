const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../database/db'); // Henter database forbindelsen fra db.js

// Modtager POST requesten fra index.js med BBR data og gemmer det i databasen
router.post('/', async (req, res) => {
    const { adresse, ejendomstype, byggeaar, boligareal, antalVaerelser } = req.body; // Pakker dataen ud fra request

    try {
        const pool = await getPool(); // Henter database forbindelsen
        await pool.request() 
            // .input() bruges til at sende dataen ind i databasen, sikkert uden at risikere at slette tabellen.
            .input('adresse', sql.VarChar, adresse)
            .input('ejendomstype', sql.VarChar, ejendomstype)
            .input('byggeaar', sql.Int, byggeaar) // skriver INT for det skal være tal
            .input('boligareal', sql.Int, boligareal)
            .input('antalVaerelser', sql.Int, antalVaerelser)
            .query(`INSERT INTO Ejendomsinvestering.Ejendom 
                    (adresse, ejendomstype, byggeaar, boligareal, antalVaerelser)
                    VALUES (@adresse, @ejendomstype, @byggeaar, @boligareal, @antalVaerelser)`);

        console.log('Gemt:', adresse);
        res.status(201).json({ message: 'Ejendom gemt!' }); // 201 betyder dataen blev oprettet i databasen
    } catch (err) {
        console.log('Fejl ved gem:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; // exporterer router så den kan bruges i app.js