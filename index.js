const Piscina = require("piscina");
const {SQLiteDatabase} = require("./config/sqlite");
const pool = new Piscina({
    minThreads: 2,
    maxThreads: 4
});
const options = {
    filename: './scrapper-worker.js',
}

const runIndexScrapperJobs = async () => {
    const jobList = [];
    for(let i = 0; i<26; i++) {
        jobList.push({
            url: `https://www.treesandshrubsonline.org/articles/${String.fromCharCode(65+i)}/`,
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
    sqLiteDatabase.openConnection();
    const jobList = await sqLiteDatabase.selectTable('scraper_jobs', {done: 0});

    // const jobList = [
    // {
    // url: 'https://www.treesandshrubsonline.org/articles/abelia/abelia-chinensis/',
    // urlType: 'plant'
    // },
    // {
    //     url: 'https://pfaf.org/User/Plant.aspx?LatinName=Pteridium+aquilinum',
    //     urlType: 'plant'
    // },
    // ]

    const jobPromises = [];

    for (let i = 0; i < jobList.length; i++) {
        const url = jobList[i].url;
        const urlType = jobList[i].urlType;
        jobPromises.push(pool.run({url, urlType, worker: i, }, options).then(
            sqLiteDatabase.up
        ))
    }
    await Promise.all(jobPromises).then(() => {
        console.log("Done")
    });

}

// runIndexScrapperJobs();
runPageScrapperJobs();



