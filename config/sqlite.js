const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const {valueSymbol} = require("piscina");

class SQLiteDatabase {
    constructor(filename) {
        this.filename = filename;
    }

    async openConnection(){
        this.db = await sqlite.open({filename: this.filename, driver: sqlite3.Database});
    }

    async insertIntoTable(tableName, dataToInsert){

        const {columns, values} = this.jsonToSqlColumnsAndValues(tableName, dataToInsert);

        const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${Array(values.length).fill('?').join(', ')})`;

        const result = await this.db.run(query, values);

        console.log('Row inserted successfully.');
    }

    jsonToSqlColumnsAndValues(tableName, data) {
        const keys = Object.keys(data);
        const values = keys.map(key => data[key]);
        const columns = keys.map(key => key.replace(' ', '_').toLowerCase());

        return {
            columns,
            values,
        };
    }
}

module.exports = {SQLiteDatabase};
