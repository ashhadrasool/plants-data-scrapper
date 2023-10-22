const sqlite3 = require('sqlite3');

const {valueSymbol} = require("piscina");

class SQLiteDatabase {
    constructor(filename) {
        this.filename = filename;
    }

    openConnection(){
        this.db = new sqlite3.Database(this.filename);
    }
    closeConnection(){
        return this.db.close();
    }

    async insertIntoTable(tableName, dataToInsert){

        if(!Array.isArray(dataToInsert)){
            dataToInsert = [dataToInsert];
        }
        const promises = [];

        for(let i=0; i<dataToInsert.length; i+=1){
            const {columns, values} = this.jsonToSqlColumnsAndValues(tableName, dataToInsert[i]);

            const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${Array(values.length).fill('?').join(', ')})`;

            promises.push( new Promise((resolve, reject) => {
                this.db.run(query, values, function(err, rows) {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Row inserted successfully.');
                        resolve([this]);
                    }
                });
            }));
        }
        // await promises[0];

        await Promise.all(promises).then(() => {
            console.log("Done All Inserts")
        });

    }

    jsonToSqlColumnsAndValues(tableName, data) {

        if(Array.isArray(data)){
            const keys = Object.keys(data[0]);
            const values = data.map( d => {
                return keys.map(key => Array.isArray(d[key]) ? JSON.stringify(d[key]) : d[key]);
            })
            const columns = keys.map(key => key.replace(' ', '_').toLowerCase());

            return {
                columns,
                values,
            };

        }
        const keys = Object.keys(data);
        const values = keys.map(key => Array.isArray(data[key]) ? JSON.stringify(data[key]) : data[key]);
        const columns = keys.map(key => key.replace(' ', '_').toLowerCase());

        return {
            columns,
            values,
        };
    }
}

module.exports = {SQLiteDatabase};
