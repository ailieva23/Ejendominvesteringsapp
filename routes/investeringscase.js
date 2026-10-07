const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../database/db'); // Henter database forbindelsen fra db.js

// GEMMER INVESTERINGSCASE I DATABASE
router.post('/', async (req, res) => {
    const {
        adresse, caseNavn, caseBeskrivelse, ejendomspris,
        advokat, tinglysning, koberraadgivning, laanebeloeb, rente,
        loebetid, afdragsperiode, laantype,
        renoveringUdgifter, renoveringTidspunkt,
        vedligeholdelse, forsikring, maanedligLeje,
        udlejningsudgifter
    } = req.body; // Pakker data ud fra request

    try {
        const pool = await getPool();

        // Finder idEjendom baseret på adresse
        const ejendom = await pool.request()
            .input('adresse', sql.VarChar, adresse)
            .query('SELECT idEjendom FROM Ejendomsinvestering.Ejendom WHERE adresse = @adresse');

        const idEjendom = ejendom.recordset[0]?.idEjendom;

        if (!idEjendom) {
            return res.status(404).json({ error: 'Ejendom ikke fundet i databasen' });
        }

        // Redigerer ejendomsprofil
        const profil = await pool.request()
            .input('idEjendom', sql.Int, idEjendom)
            .query(`SELECT idEjendomsprofil 
                    FROM Ejendomsinvestering.Ejendomsprofil
                    WHERE idEjendom = @idEjendom`);
        
        const idEjendomsprofil = profil.recordset[0].idEjendomsprofil;

        // Opretter investeringscase inkl. advokat, tinglysning og køberrådgivning
        const investCase = await pool.request()
            .input('idEjendomsprofil', sql.Int, idEjendomsprofil)
            .input('caseNavn', sql.VarChar, caseNavn)
            .input('caseBeskrivelse', sql.VarChar, caseBeskrivelse)
            .input('ejendomspris', sql.Int, ejendomspris)
            .input('advokat', sql.Int, advokat)
            .input('tinglysning', sql.Int, tinglysning)
            .input('koberraadgivning', sql.Int, koberraadgivning)
            .input('omkostninger', sql.Int, (advokat || 0) + (tinglysning || 0) + (koberraadgivning || 0))
            .query(`INSERT INTO Ejendomsinvestering.Investeringscase 
                    (idEjendomsprofil, pris, oprettelsesdato, omkostninger, caseNavn, caseBeskrivelse, advokat, tinglysning, koberraadgivning) 
                    OUTPUT INSERTED.idInvesteringscase
                    VALUES (@idEjendomsprofil, @ejendomspris, GETDATE(), @omkostninger, @caseNavn, @caseBeskrivelse, @advokat, @tinglysning, @koberraadgivning)`);

        const idInvesteringscase = investCase.recordset[0].idInvesteringscase;

        // Gemmer finansiering
        await pool.request()
            .input('idInvesteringscase', sql.Int, idInvesteringscase)
            .input('laanebeloeb', sql.Int, laanebeloeb)
            .input('rente', sql.Decimal(4, 2), rente)
            .input('loebetid', sql.Int, loebetid)
            .input('afdragsperiode', sql.Int, afdragsperiode)
            .input('laantype', sql.VarChar, laantype)
            .query(`INSERT INTO Ejendomsinvestering.Finansering 
                    (idInvesteringscase, laanebeloeb, rente, loebetid, afdragsperiode, laantype) 
                    VALUES (@idInvesteringscase, @laanebeloeb, @rente, @loebetid, @afdragsperiode, @laantype)`);


        // Gemmer renovering hvis der er angivet udgifter
        if (renoveringUdgifter) {
            await pool.request()
                .input('idInvesteringscase', sql.Int, idInvesteringscase)
                .input('udgifter', sql.Int, renoveringUdgifter)
                .input('tidspunkt', sql.Date, renoveringTidspunkt || null) // null hvis tom
                .query(`INSERT INTO Ejendomsinvestering.Renovering 
                (idInvesteringscase, udgifter, tidspunkt) 
                VALUES (@idInvesteringscase, @udgifter, @tidspunkt)`);
        }

        // Gemmer drift
        await pool.request()
            .input('idEjendom', sql.Int, idEjendom)
            .input('vedligeholdelse', sql.Int, vedligeholdelse)
            .input('forsikring', sql.Int, forsikring)
            .input('lejeindtaegt', sql.Int, maanedligLeje)
            .input('udlejningsudgifter', sql.Int, udlejningsudgifter)
            .query(`INSERT INTO Ejendomsinvestering.Drift 
                    (idEjendom, vedligeholdelse, forsikring, lejeindtaegt, udlejningsudgifter) 
                    VALUES (@idEjendom, @vedligeholdelse, @forsikring, @lejeindtaegt, @udlejningsudgifter)`);

        console.log('Investeringscase gemt:', caseNavn);
        res.status(201).json({ message: 'Investeringscase gemt!' });

    } catch (err) {
        console.log('Fejl ved gem af case:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// HENTER ALLE INVESTERINGSCASES FRA DATABASE
router.get('/', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .query(`SELECT 
                        ic.idInvesteringscase,
                        ic.pris,
                        ic.oprettelsesdato,
                        ic.omkostninger,
                        ic.caseNavn,
                        ic.caseBeskrivelse,
                        ic.advokat,
                        ic.tinglysning,
                        ic.koberraadgivning,
                        e.adresse,
                        e.byggeaar,
                        e.boligareal
                    FROM Ejendomsinvestering.Investeringscase ic
                    JOIN Ejendomsinvestering.Ejendomsprofil ep ON ic.idEjendomsprofil = ep.idEjendomsprofil
                    JOIN Ejendomsinvestering.Ejendom e ON ep.idEjendom = e.idEjendom`);

        res.json(result.recordset);
    } catch (err) {
        console.log('Fejl ved hentning af cases:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// HENTER EN SPECIFIK INVESTERINGSCASE FRA DATABASE
router.get('/:id', async (req, res) => {
    const id = req.params.id; // Henter id fra URL

    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`SELECT 
                        ic.idInvesteringscase,
                        ic.pris,
                        ic.omkostninger,
                        ic.oprettelsesdato,
                        ic.caseNavn,
                        ic.caseBeskrivelse,
                        ic.advokat,
                        ic.tinglysning,
                        ic.koberraadgivning,
                        f.laanebeloeb,
                        f.rente,
                        f.loebetid,
                        f.afdragsperiode,
                        f.laantype,
                        r.udgifter AS renoveringUdgifter,
                        r.tidspunkt AS renoveringTidspunkt,
                        d.vedligeholdelse,
                        d.forsikring,
                        d.lejeindtaegt,
                        d.udlejningsudgifter,
                        e.adresse,
                        e.byggeaar,
                        e.boligareal
                    FROM Ejendomsinvestering.Investeringscase ic
                    JOIN Ejendomsinvestering.Ejendomsprofil ep ON ic.idEjendomsprofil = ep.idEjendomsprofil
                    JOIN Ejendomsinvestering.Ejendom e ON ep.idEjendom = e.idEjendom
                    LEFT JOIN Ejendomsinvestering.Finansering f ON ic.idInvesteringscase = f.idInvesteringscase
                    LEFT JOIN Ejendomsinvestering.Renovering r ON ic.idInvesteringscase = r.idInvesteringscase
                    LEFT JOIN Ejendomsinvestering.Drift d ON e.idEjendom = d.idEjendom
                    WHERE ic.idInvesteringscase = @id`);

        res.json(result.recordset[0]);
    } catch (err) {
        console.log('Fejl ved hentning af case:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// SLETTER INVESTERINGSCASE FRA DATABASE
router.delete('/:id', async (req, res) => {
    const id = req.params.id; // Henter id fra URL

    try {
        const pool = await getPool();

        // Sletter i rigtig rækkefølge pga. foreign keys
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Ejendomsinvestering.Finansering WHERE idInvesteringscase = @id');

        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Ejendomsinvestering.Renovering WHERE idInvesteringscase = @id');

        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Ejendomsinvestering.Investeringscase WHERE idInvesteringscase = @id');

        console.log('Investeringscase slettet:', id);
        res.json({ message: 'Investeringscase slettet!' });
    } catch (err) {
        console.log('Fejl ved sletning:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// OPDATERER INVESTERINGSCASE I DATABASE
router.put('/:id', async (req, res) => {
    const id = req.params.id; // Henter id fra URL
    const {
        caseNavn, caseBeskrivelse, ejendomspris, advokat, tinglysning, koberraadgivning,
        laanebeloeb, rente, loebetid, afdragsperiode, laantype,
        renoveringUdgifter, renoveringTidspunkt,
        vedligeholdelse, forsikring, maanedligLeje, udlejningsudgifter
    } = req.body; // Pakker data ud fra request

    try {
        const pool = await getPool();

        // Opdaterer investeringscase inkl. advokat, tinglysning og køberrådgivning
        await pool.request()
            .input('id', sql.Int, id)
            .input('caseNavn', sql.VarChar, caseNavn)
            .input('caseBeskrivelse', sql.VarChar, caseBeskrivelse)
            .input('ejendomspris', sql.Int, ejendomspris)
            .input('advokat', sql.Int, advokat)
            .input('tinglysning', sql.Int, tinglysning)
            .input('koberraadgivning', sql.Int, koberraadgivning)
            .input('omkostninger', sql.Int, (advokat || 0) + (tinglysning || 0) + (koberraadgivning || 0))
            .query(`UPDATE Ejendomsinvestering.Investeringscase 
                    SET pris = @ejendomspris, omkostninger = @omkostninger,
                        caseNavn = @caseNavn, caseBeskrivelse = @caseBeskrivelse,
                        advokat = @advokat, tinglysning = @tinglysning, koberraadgivning = @koberraadgivning
                    WHERE idInvesteringscase = @id`);

        // Opdaterer finansiering
        await pool.request()
            .input('id', sql.Int, id)
            .input('laanebeloeb', sql.Int, laanebeloeb)
            .input('rente', sql.Decimal(4, 2), rente)
            .input('loebetid', sql.Int, loebetid)
            .input('afdragsperiode', sql.Int, afdragsperiode)
            .input('laantype', sql.VarChar, laantype)
            .query(`UPDATE Ejendomsinvestering.Finansering 
                    SET laanebeloeb = @laanebeloeb, rente = @rente, loebetid = @loebetid,
                        afdragsperiode = @afdragsperiode, laantype = @laantype
                    WHERE idInvesteringscase = @id`);

        // Opdaterer eller indsætter renovering
        if (renoveringUdgifter) {
            // Tjekker om der allerede er en renovering
            const eksisterendeRenovering = await pool.request()
                .input('id', sql.Int, id)
                .query('SELECT idRenovering FROM Ejendomsinvestering.Renovering WHERE idInvesteringscase = @id');

            if (eksisterendeRenovering.recordset.length > 0) {
                // Opdaterer eksisterende renovering
                await pool.request()
                    .input('id', sql.Int, id)
                    .input('udgifter', sql.Int, renoveringUdgifter)
                    .input('tidspunkt', sql.Date, renoveringTidspunkt || null)
                    .query(`UPDATE Ejendomsinvestering.Renovering 
                    SET udgifter = @udgifter, tidspunkt = @tidspunkt
                    WHERE idInvesteringscase = @id`);
            } else {
                // Indsætter ny renovering
                await pool.request()
                    .input('id', sql.Int, id)
                    .input('udgifter', sql.Int, renoveringUdgifter)
                    .input('tidspunkt', sql.Date, renoveringTidspunkt || null)
                    .query(`INSERT INTO Ejendomsinvestering.Renovering 
                    (idInvesteringscase, udgifter, tidspunkt) 
                    VALUES (@id, @udgifter, @tidspunkt)`);
            }
        }

        // Opdaterer drift
        await pool.request()
            .input('id', sql.Int, id)
            .input('vedligeholdelse', sql.Int, vedligeholdelse)
            .input('forsikring', sql.Int, forsikring)
            .input('lejeindtaegt', sql.Int, maanedligLeje)
            .input('udlejningsudgifter', sql.Int, udlejningsudgifter)
            .query(`UPDATE Ejendomsinvestering.Drift 
                    SET vedligeholdelse = @vedligeholdelse, forsikring = @forsikring,
                        lejeindtaegt = @lejeindtaegt, udlejningsudgifter = @udlejningsudgifter
                    WHERE idEjendom = (
                        SELECT e.idEjendom FROM Ejendomsinvestering.Ejendom e
                        JOIN Ejendomsinvestering.Ejendomsprofil ep ON e.idEjendom = ep.idEjendom
                        JOIN Ejendomsinvestering.Investeringscase ic ON ep.idEjendomsprofil = ic.idEjendomsprofil
                        WHERE ic.idInvesteringscase = @id)`);

        console.log('Investeringscase opdateret:', id);
        res.json({ message: 'Investeringscase opdateret!' });
    } catch (err) {
        console.log('Fejl ved opdatering:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;