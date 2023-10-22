const {SQLiteDatabase} = require("./config/sqlite");
const path = require('path');
const treesAndShrubScraper = require('./scrapper/trees-and-shrubs-scrapper');
const pfascraper = require('./scrapper/pfa-scrapper');

const dbName = 'plants-sqlite.db';

module.exports = async function ({ url, urlType, workerId }) {
    const filePath = path.join(__dirname, dbName);

    const db = new SQLiteDatabase(filePath);
    db.openConnection();

    let data;

    if(urlType=='index'){
        if(url.includes('treesandshrubsonline')){
            data = await treesAndShrubScraper.scrapeIndexPage(url);
        }else if(url.includes('treesandshrubs')){
            data = await pfascraper.scrapeIndexPage(url);
        }
        const dataToInsert = data.map(url => {
            const done = 0;
            return {
                url,
                done
            };
        });

        console.log(await db.insertIntoTable('scraper_jobs', dataToInsert));
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

        console.log(await db.insertIntoTable('species', [dataToInsert]));
    }

    db.closeConnection();
};


