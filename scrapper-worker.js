const DatabaseManager = require("./config/database-manager");
const path = require('path');

const dbName = 'plants-sqlite.db';


module.exports = async function ({ url, workerId }) {
    const filePath = path.join(__dirname, dbName);

    const dbManager = new DatabaseManager(filePath);
    const db = await dbManager.createConnection();

    const dataToInsert = {
        'Scientific Name': 'Abelia chinensis R. Br.',
        Genus: 'Abelia',
        'Common Names': 'Chinese Abelia',
        Synonyms: [
            'Abelia rupestris Lindl.',
            'Linnaea chinensis (R. Br.) A. Braun & Vatke',
            'Linnaea ruprestris (Lindl.) A. Braun & Vatke',
            'Abelia hanceana M. Martens ex Hance',
            'Abelia ionandra Hayata',
            'Abelia lipoensis M.T. An & G.Q. Gou',
            'Linnaea aschersoniana Graebn.'
        ],
        Varieties: [ 'China Rose', 'Keiser', 'White Surprise' ],
        Distribution: 'China Fujian, Guangdong, Guangxi, Guizhou, Henan, Hubei, Hunan, Jiangsu, Jiangxi, Sichuan, Yunnan, Zhejiang. Japan Ryukyu Islands Taiwan',
        Habitat: 'Mountain forests to 1500 m asl.',
        'USDA Hardiness Zone': '7',
        'RHS Hardiness Rating': 'RHS Hardiness Rating H5',
        Awards: 'AGM',
        'Conservation status': 'Least concern (LC)'
    };

    db.insertIntoTable('species', dataToInsert);
};
