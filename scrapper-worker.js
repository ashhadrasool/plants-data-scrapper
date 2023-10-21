const DatabaseManager = require("./config/database-manager");
const path = require('path');
const treesAndShrubScraper = require('./scrapper/trees-and-shrubs-scrapper');
const pfascraper = require('./scrapper/pfa-scrapper');

const dbName = 'plants-sqlite.db';

async function(){

}

module.exports = async function ({ url, urlType, workerId }) {
    const filePath = path.join(__dirname, dbName);

    const dbManager = new DatabaseManager(filePath);
    const db = await dbManager.createConnection();

    let data;

    if(urlType=='index'){
        if(url.includes('treesandshrubsonline')){
            data = await treesAndShrubScraper.scrapeIndexPage(url);
        }else if(url.includes('treesandshrubsonline')){
            data = await pfascraper.scrapeIndexPage(url);
        }

        console.log(await db.insertIntoTable('scrape_job', dataToInsert));
    }
    else if(urlType=='plant'){
        if(url.includes('treesandshrubsonline')){
            data = await treesAndShrubScraper.scrapePlantPage(url);
        }else if(url.includes('treesandshrubsonline')){
            data = await pfascraper.scrapePlantPage(url);
        }

        const dataToInsert = {
            'Scientific Name': 'Abelia chinensis R. Br.',
            // Genus: 'Abelia',
            'Common Name': 'Chinese Abelia',
            // Synonyms: [
            //     'Abelia rupestris Lindl.',
            //     'Linnaea chinensis (R. Br.) A. Braun & Vatke',
            //     'Linnaea ruprestris (Lindl.) A. Braun & Vatke',
            //     'Abelia hanceana M. Martens ex Hance',
            //     'Abelia ionandra Hayata',
            //     'Abelia lipoensis M.T. An & G.Q. Gou',
            //     'Linnaea aschersoniana Graebn.'
            // ],
            Varieties: [ 'China Rose', 'Keiser', 'White Surprise' ],
            // Distribution: 'China Fujian, Guangdong, Guangxi, Guizhou, Henan, Hubei, Hunan, Jiangsu, Jiangxi, Sichuan, Yunnan, Zhejiang. Japan Ryukyu Islands Taiwan',
            // Habitat: 'Mountain forests to 1500 m asl.',
            // 'USDA Hardiness Zone': '7',
            // 'RHS Hardiness Rating': 'RHS Hardiness Rating H5',
            // Awards: 'AGM',
            // 'Conservation status': 'Least concern (LC)'
        };

        console.log(await db.insertIntoTable('species', dataToInsert));
    }

    console.log(data);


};


