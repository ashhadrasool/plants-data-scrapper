const Piscina = require("piscina");
const {SQLiteDatabase} = require("./config/sqlite");
const ConfigProperties = require("./config/config-properties");
const fs = require('fs');

const csv = require('csv-parser');
const {existsSync} = require("fs");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvFilePath = './output.csv'

const pool = new Piscina({
    minThreads: ConfigProperties.MIN_THREADS,
    maxThreads: ConfigProperties.MAX_THREADS
});
const options = {
    filename: './scrapper-worker.js',
}

const runIndexScrapperJobs = async () => {
    const jobList = [];
    // for(let i = 0; i<26; i++) {
    //     jobList.push({
    //         url: `https://www.treesandshrubsonline.org/articles/${String.fromCharCode(65+i)}/`,
    //         urlType: 'index'
    //     });
    // }

    for(let i = 0; i<26; i++) {
        jobList.push({
            url: `https://pfaf.org/User/DatabaseSearhResult.aspx?LatinName=${String.fromCharCode(65+i)}%/`,
            urlType: 'index'
        });
    }

    const jobPromises = [];

    for (let i = 0; i < jobList.length; i++) {
        const url = jobList[i].url;
        const urlType = jobList[i].urlType;
        jobPromises.push(
            pool.run({url, urlType, worker: i, }, options).then(res =>
                console.log('res', res)
            )
        )
    }
    await Promise.all(jobPromises).then(() => {
        console.log("Done")
    });

}

const runPageScrapperJobs = async () => {

    let headers = [];
    let csvHeaders = [];
    if(fs.existsSync(csvFilePath)){
        const readStream = fs.createReadStream(csvFilePath);
        readStream
            .pipe(csv())
            .on('headers', (h) => {
                headers = h;
            })
    }
    const sqLiteDatabase = new SQLiteDatabase();
    await sqLiteDatabase.openConnection();
    let jobList = await sqLiteDatabase.selectTable('scraper_jobs', {done: 0});

    // jobList = jobList.slice(0,1);  // if you want to debug and run some jobs

    const jobPromises = [];

    for (let i = 0; i < jobList.length; i++) {
        const url = jobList[i].url;
        const urlType = 'plant';
        jobPromises.push(pool.run({url, urlType, worker: i, }, options).then( async (res)=> {
            console.log(res);
            // res = stringifyObjectValues(res);

            const objectKeys = Object.keys(res);

            let newHeaders = false;
            objectKeys.forEach(k => {
                if(!headers.includes(k)){
                    headers.push(k);
                    newHeaders = true;
                }
            })

            const csvHeaders = headers.map( key => {
                return {
                    id: key,
                    title: key
                }
            });

            let csvWriter = undefined;
            if(!fs.existsSync(csvFilePath) || newHeaders){
                const oldData = [];
                csvWriter = createCsvWriter({
                    path: csvFilePath,
                    header: csvHeaders,
                });
                if(fs.existsSync(csvFilePath)){
                    const readStream = fs.createReadStream(csvFilePath);
                    readStream
                        .pipe(csv())
                        .on('data',  (row) => {
                            oldData.push(row);
                        });

                    oldData.forEach( (row) => {
                        csvWriter.writeRecords(row);
                    });
                }
            }else{
                csvWriter = createCsvWriter({
                    path: csvFilePath,
                    header: csvHeaders,
                    append: true,
                });
            }

            data = [res];

            await csvWriter.writeRecords(data)
                .then(() => {
                    console.log('CSV file has been written');
                })
                .catch((error) => {
                    console.error(error);
                });
            sqLiteDatabase.updateTable('scraper_jobs',{done: 1}, {url});
            console.log(`Scrapped job ${i+1}: ${url}`);
        }
        ).catch(e => console.log('error in scrapping:', url, e)));
    }
    await Promise.all(jobPromises).then(() => {
        console.log("Done All Scrapper Jobs")
    });

    await sqLiteDatabase.closeConnection();
}

function stringifyObjectValues(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                // If the value is an object (recursively stringify its values)
                obj[key] = stringifyObjectValues(obj[key]);
            } else {
                // If the value is not an object, stringify it
                obj[key] = JSON.stringify(obj[key]);
            }
        }
    }
    return obj;
}

const generateCSV = async () => {

    const sqLiteDatabase = new SQLiteDatabase();
    await sqLiteDatabase.openConnection();

    let data = await sqLiteDatabase.selectTable('species');

    data.forEach(row => delete row['id']);

    const headers = Object.keys(data[0]).map( key => {
        return {
            id: key,
            title: key
        }
    });
    const csvWriter = createCsvWriter({
        path: csvFilePath,
        header: headers,
    });

    data = [data[0]];
    csvWriter.writeRecords(data)
        .then(() => {
            console.log('CSV file has been written');
        })
        .catch((error) => {
            console.error(error);
        });

}


(async ()=>  {
    // await runIndexScrapperJobs(); //disabled because all index pages are already scrapped and are part of db,

    await runPageScrapperJobs();
    // await generateCSV(); // enable when want to generate output.csv
})();

