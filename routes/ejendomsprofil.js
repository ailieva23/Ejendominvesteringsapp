const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../database/db'); // Henter database forbindelsen fra db.js

// Modtager POST request fra gemProfilBtn i ejendomsprofil.js og gemmer ejendomsprofilen i databasen.
router.post('/', async (req, res) => {
    const { adresse } = req.body; // Pakker data ud fra request

    try {
        const pool = await getPool();

        // Finder idEjendom baseret på adresse fra databasen
        const ejendom = await pool.request()
            .input('adresse', sql.VarChar, adresse)
            .query('SELECT idEjendom FROM Ejendomsinvestering.Ejendom WHERE adresse = @adresse');

        const idEjendom = ejendom.recordset[0]?.idEjendom; //  henter ejendomsId fra resultatet 

        // sender fejl hvis ejendommen ikke findes i databasen. 
        if (!idEjendom) {
            return res.status(404).json({ error: 'Ejendom ikke fundet i databasen' });
        }

        // Opretter ejendomsprofil med oprettelsestidspunkt i databasen
        await pool.request()
        // .input() bruges til at sende dataen ind i databasen, sikkert uden at risikere at slette tabellen eller stjæle data.
            .input('idEjendom', sql.Int, idEjendom)
            .query(`INSERT INTO Ejendomsinvestering.Ejendomsprofil (idEjendom, oprettetDato) 
                    VALUES (@idEjendom, GETDATE())`); // henter den nuværende dato fra databasen

        console.log('Ejendomsprofil gemt:', adresse);
        res.status(201).json({ message: 'Ejendomsprofil gemt!' }); // 201 betyder data er oprettet korrekt
    } catch (err) {
        console.log('Fejl ved gem af ejendomsprofil:', err.message); 
        res.status(500).json({ error: err.message }); // 500 er fejl
    }
});

// Modtager GET requsten fra hentProfiler() i ejendomsprofiler.js som henter alle ejendomsporfiler fra databasen 
router.get('/', async (req, res) => {
    try {
        const pool = await getPool();
        // Henter alle ejendomsprofiler og joiner dem med ejendom og investeringscase tabellerne
        // COUNT tæller antal af investeringscases per profil
        const result = await pool.request()
        // Bruger JOIN og LEFT JOIN, da JOIN returnerer rækker der findes i begge tabeller. Dvs kun profiler med ejendom vises.
        // LEFT JOIN returnerer alle rækker fra den venstre tabel. Ejendomprofiler kan sagtens ikke have en investeringscase tilknyttet.
            .query(`SELECT 
                        ep.idEjendomsprofil,
                        ep.oprettetDato,
                        e.adresse,
                        e.ejendomstype,
                        e.byggeaar,
                        e.boligareal,
                        e.antalVaerelser,
                        COUNT(ic.idInvesteringscase) AS antalCases
                    FROM Ejendomsinvestering.Ejendomsprofil ep
                    JOIN Ejendomsinvestering.Ejendom e ON ep.idEjendom = e.idEjendom
                    LEFT JOIN Ejendomsinvestering.Investeringscase ic ON ep.idEjendomsprofil = ic.idEjendomsprofil
                    GROUP BY ep.idEjendomsprofil, ep.oprettetDato, e.adresse, e.ejendomstype, e.byggeaar, e.boligareal, e.antalVaerelser`);

        res.json(result.recordset); // sender alle profiler tilbage til browseren
    } catch (err) {
        console.log('Fejl ved hentning af ejendomsprofiler:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Modtager DELETE request fra sletProfil() i ejendomsprofiler.js som sletter ejendomsprofilen fra databasen.
router.delete('/:id', async (req, res) => {
    const id = req.params.id; // Henter id'en fra URL

    try {
        const pool = await getPool();

        // Sletter dataen i rigtig rækkefølge pga. foreign keys (børn før forældre)
        // sletter finansiering
        await pool.request()
            .input('id', sql.Int, id)
            .query(`DELETE FROM Ejendomsinvestering.Finansering 
                    WHERE idInvesteringscase IN (
                        SELECT idInvesteringscase FROM Ejendomsinvestering.Investeringscase 
                        WHERE idEjendomsprofil = @id)`);
        // sletter renovering
        await pool.request()
            .input('id', sql.Int, id)
            .query(`DELETE FROM Ejendomsinvestering.Renovering 
                    WHERE idInvesteringscase IN (
                        SELECT idInvesteringscase FROM Ejendomsinvestering.Investeringscase 
                        WHERE idEjendomsprofil = @id)`);
        // sletter investeringscases
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Ejendomsinvestering.Investeringscase WHERE idEjendomsprofil = @id');
        // sletter ejendomsprofilen
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Ejendomsinvestering.Ejendomsprofil WHERE idEjendomsprofil = @id');

        console.log('Ejendomsprofil slettet:', id);
        res.json({ message: 'Ejendomsprofil slettet!' });
    } catch (err) {
        console.log('Fejl ved sletning:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;