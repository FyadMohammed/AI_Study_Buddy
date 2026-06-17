const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDirectory = path.join(__dirname, '..', 'data');
const databasePath = path.join(dataDirectory, 'study.db');
const schemaPath = path.join(__dirname, 'schema.sql');

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
}

const database = new Database(databasePath);

database.pragma('foreign_keys = ON');

const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
database.exec(schemaSql);

module.exports = database;
