const Piscina = require("piscina");
const {SQLiteDatabase} = require("./config/sqlite");
const ConfigProperties = require("./config/config-properties");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

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
        jobPromises.push(pool.run({url, urlType, worker: i, }, options))
    }
    await Promise.all(jobPromises).then(() => {
        console.log("Done")
    });

}

const runPageScrapperJobs = async () => {

    const sqLiteDatabase = new SQLiteDatabase();
    await sqLiteDatabase.openConnection();
    let jobList = await sqLiteDatabase.selectTable('scraper_jobs', {done: 0});

    // jobList = jobList.slice(0,1);  // if you want to debug and run some jobs

    const jobPromises = [];

    for (let i = 0; i < jobList.length; i++) {
        const url = jobList[i].url;
        const urlType = 'plant';
        jobPromises.push(pool.run({url, urlType, worker: i, }, options).then( ()=> {
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
        path: 'output.csv',
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
    await generateCSV(); // enable when want to generate output.csv
})();

