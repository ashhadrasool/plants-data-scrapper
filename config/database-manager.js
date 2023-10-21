const {SQLiteDatabase} = require('./sqlite');
class DatabaseManager {
    constructor(databaseFile) {
        this.sqLiteDatabase = new SQLiteDatabase(databaseFile);
    }

    async createConnection() {
        if (this.db) {
            console.warn('A database connection is already open.');
            return this.db;
        }

        try {
            await this.sqLiteDatabase.openConnection();
            console.log('Connected to the SQLite database.');
            return this.sqLiteDatabase;
        } catch (error) {
            console.error('Error connecting to the database:', error);
            throw error;
        }
    }

    async closeConnection() {
        if (!this.db) {
            console.warn('No active database connection to close.');
            return;
        }

        try {
            await this.db.close();
            this.db = null;
            console.log('Disconnected from the SQLite database.');
        } catch (error) {
            console.error('Error closing the database connection:', error);
            throw error;
        }
    }
}

module.exports = DatabaseManager;
