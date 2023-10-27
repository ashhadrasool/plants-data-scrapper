const {SQLiteDatabase} = require("./config/sqlite");
const treesAndShrubScraper = require('./scrapper/trees-and-shrubs-scrapper');
const pfascraper = require('./scrapper/pfa-scrapper');

module.exports = async function ({ url, urlType, workerId }) {


    const db = new SQLiteDatabase();
    await db.openConnection();

    let data;

    if(urlType=='index'){
        try {
            if(url.includes('treesandshrubsonline')){
                data = await treesAndShrubScraper.scrapeIndexPage(url);
            }else if(url.includes('pfaf.org')){
                data = await pfascraper.scrapeIndexPage(url);
            }
            const dataToInsert = data.map(scrappedUrl => {
                return {
                    url: scrappedUrl,
                    done : 0
                };
            });

            for(let i=0; i< dataToInsert.length; i++){
                try {
                    await db.insertIntoTable('scraper_jobs', dataToInsert[i]);
                }catch (e){
                    console.log(dataToInsert[i], e);
                }
            }

            // await db.insertIntoTable('scraper_jobs', dataToInsert);
        }catch (e){
            console.log(url, e);
        }
    }
    else if(urlType=='plant'){
        if(url.includes('treesandshrubsonline')){
            data = await treesAndShrubScraper.scrapePlantPage(url);
        }else if(url.includes('pfaf.org')){
            data = await pfascraper.scrapePlantPage(url);
        }

        const dataToInsert = data;
        await db.insertIntoTable('species', [dataToInsert]);
    }

    await db.closeConnection();
};


