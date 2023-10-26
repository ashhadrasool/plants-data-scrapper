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

    for(let i = 0; i<26; i++) {
        jobList.push({
            url: `https://pfaf.org/user/DatabaseSearhResult.aspx?LatinName=${String.fromCharCode(65+i)}%/`,
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
    // let jobList = await sqLiteDatabase.selectTable('scraper_jobs', {done: 0});

    // jobList = jobList.slice(0,1);
    const jobList = [
    {
    url: 'https://www.treesandshrubsonline.org/articles/abies/abies-cephalonica/',
    urlType: 'plant'
    },
    // {
    //     url: 'https://pfaf.org/User/Plant.aspx?LatinName=Pteridium+aquilinum',
    //     urlType: 'plant'
    // },
    ]

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


(async ()=>  {
    // await runIndexScrapperJobs();
    await runPageScrapperJobs();
})();

