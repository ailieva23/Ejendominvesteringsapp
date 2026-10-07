require('dotenv').config();      
const sql = require('mssql');    

const config = {
    user: process.env.DB_USER,         // brugernavn fra .env
    password: process.env.DB_PASSWORD, // kodeord fra .env
    server: process.env.DB_SERVER,     // serveradresse fra .env
    database: 'master',
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function connectDB() {
    try {
        const pool = await sql.connect(config);
        console.log('Forbindelse lykkedes!');

        // Denne query beder serveren fortælle os navnene på ALLE tabeller
        const result = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
        `);

        console.log('Jeg har fundet følgende tabeller til dig:');
        console.table(result.recordset);

        const testData = await pool.request().query('SELECT navn FROM Ejendomsinvestering.Bruger');
        /* Der skal stå Ejendomsinvestering.Table_Name,
        fordi i skabelonen ovenover angiver vi følgende:
         SELECT TABLE_NAME 
         FROM INFORMATION_SCHEMA.TABLES
        */
        console.log(testData.recordset);

    } catch (err) {
        console.error('Kunne ikke forbinde:', err.message);
    }
}

let pool;

async function getPool() { 
    if (!pool) {
        pool = await sql.connect(config);
    }
    return pool;
}

module.exports = { getPool, sql };

connectDB();

// Vi tester database ved at skrive node database-db.js i terminalen