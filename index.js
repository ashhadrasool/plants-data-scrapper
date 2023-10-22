const Piscina = require("piscina");

const runIndexScrapperJobs = async () => {
    const Piscina = require("piscina");

    const pool = new Piscina({minThreads: 8});
    const options = {
        filename: './scrapper-worker.js',
    }
    const jobList = [
        // {
        // url: 'https://www.treesandshrubsonline.org/articles/abelia/abelia-chinensis/',
        // urlType: 'plant'
        // },
        // {
        //     url: 'https://pfaf.org/User/Plant.aspx?LatinName=Pteridium+aquilinum',
        //     urlType: 'plant'
        // },
        // {
        //     url: 'https://pfaf.org/user/DatabaseSearhResult.aspx?LatinName=A%',
        //     urlType: 'index'
        // },
        {
            url: 'https://www.treesandshrubsonline.org/articles/A/',
            urlType: 'index'
        },

    ]

    const jobPromises = [];

    for (let i = 0; i < jobList.length; i++) {
        const url = jobList[i].url;
        const urlType = jobList[i].urlType;
        jobPromises.push(pool.run({url, urlType, worker: i, }, options))
    }

    Promise.all(jobPromises).then(() => {
        console.log("Done")
    });

}

runIndexScrapperJobs();



