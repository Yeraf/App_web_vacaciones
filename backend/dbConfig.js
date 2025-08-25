// backend/dbConfig.js
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,      // p.ej. DESKTOP-UN57ULG o tu servidor en Azure
  database: process.env.DB_DATABASE,  // VacacionesYS
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',           // en Azure: true
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true' // local: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

module.exports = config;
