import Database from 'better-sqlite3';

const dbPath = process.env.DB_PATH || './aim.db';
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export default db;
