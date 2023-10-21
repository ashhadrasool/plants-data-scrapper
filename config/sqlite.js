const sqlite3 = require('sqlite3');

const {valueSymbol} = require("piscina");

class SQLiteDatabase {
    constructor(filename) {
        this.filename = filename;
    }

    async openConnection(){
        this.db = await new sqlite3.Database(this.filename);
    }

    async insertIntoTable(tableName, dataToInsert){

        const {columns, values} = this.jsonToSqlColumnsAndValues(tableName, dataToInsert);

        const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${Array(values.length).fill('?').join(', ')})`;

        return new Promise((resolve, reject) => {
            this.db.run(query, values, function(err, rows) {
                if (err) {
                    reject(err);
                } else {
                    console.log('Row inserted successfully.');
                    resolve([this]);
                }
            });
        });

    }

    jsonToSqlColumnsAndValues(tableName, data) {
        const keys = Object.keys(data);
        const values = keys.map(key => JSON.stringify(data[key]));
        const columns = keys.map(key => key.replace(' ', '_').toLowerCase());

        return {
            columns,
            values,
        };
    }
}

module.exports = {SQLiteDatabase};
