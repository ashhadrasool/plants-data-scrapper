const sqlite3 = require('sqlite3');

const {valueSymbol} = require("piscina");
const path = require("path");
const dbName = 'plants-sqlite.db';
const filePath = path.join(__dirname, '..', dbName);

class SQLiteDatabase {
    constructor() {
        this.filename = filePath;
    }

    async openConnection(){
        new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.filename, function(err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve([this]);
                }
            });
        })
    }
    async closeConnection(){
        return new Promise((resolve, reject) => {
            this.db.close( function(err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve([this]);
                }
            });
        })
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
                        resolve([this]);
                    }
                });
            }));
        }
        // await promises[0];

        return Promise.all(promises).then(() => {
            // console.log("Done All Inserts")
            });
    }

    async selectTable(tableName, condition){

        const conditions = Object.keys(condition)
            .map(key => `${key} = ?`)
            .join(' AND ');

        const values = Object.values(condition);

        const query = `SELECT * FROM ${tableName} WHERE ${conditions}`;

        return new Promise((resolve, reject) => {
            this.db.all(query, values, (err, rows) => {
                if (err) {
                    throw err;
                }else {
                    resolve(rows);
                }
            });
        });
    }

    async updateTable(tableName, newValues, conditions){
        const conditionKeys = Object.keys(conditions);
        const conditionValues = Object.values(conditions);
        const conditionClauses = conditionKeys.map(key => `${key} = ?`).join(' AND ');

        const newValueKeys = Object.keys(newValues);
        const newValueClauses = newValueKeys.map(key => `${key} = ?`).join(', ');

        const query = `UPDATE ${tableName} SET ${newValueClauses} WHERE ${conditionClauses}`;

        const values = [...Object.values(newValues), ...conditionValues];

        return new Promise((resolve, reject) => {
            this.db.run(query, values, function (err) {
                if (err) {
                    reject(err);
                }else {
                    resolve(this.changes);
                }
            });
        });
    }

    jsonToSqlColumnsAndValues(tableName, data) {

        if(Array.isArray(data)){
            const keys = Object.keys(data[0]);
            const values = data.map( d =>
                // return keys.map(key => Array.isArray(d[key]) ? JSON.stringify(d[key]) : d[key]);
                keys.map(key => typeof d[key] === 'string'? d[key] : JSON.stringify(d[key]))
            )
            const columns = keys.map(key => key.replaceAll(' ', '_').toLowerCase());

            return {
                columns,
                values,
            };

        }
        const keys = Object.keys(data);
        const values = keys.map(key =>
            // Array.isArray(data[key]) ? JSON.stringify(data[key]) : data[key]
            typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key])
        );
        const columns = keys.map(key => key.replaceAll(' ', '_').toLowerCase());

        return {
            columns,
            values,
        };
    }
}

module.exports = {SQLiteDatabase};
