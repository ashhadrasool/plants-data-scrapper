const puppeteer = require("puppeteer");
const ConfigProperties = require("../config/config-properties");

const scrapeIndexPage = async function(url){
    const browser = await puppeteer.launch({
        headless: ConfigProperties.HEADLESS
    });

    let urls = [];
    try {
        const page = await browser.newPage();
        await page.goto(url);

        urls = await page.evaluate(() => {
            const hrefs = [];

            const plantElements = document.querySelector('.uk-grid.uk-grid-stack');

            const anchorElements = Array.from(plantElements.querySelectorAll('a'));

            anchorElements.forEach(anchor => {
                const href = anchor.getAttribute('href');
                if (href && !href.includes('#')) {
                    count = href.split('/').length;
                    if(count==5){
                        hrefs.push('https://www.treesandshrubsonline.org'+href);
                    }

                }
            });

            return hrefs;
        });

    }catch (e){
        throw e;
    }finally {
        await browser.close();
    }

    return urls;
}

scrapePlantPage = async function(url){
    const browser = await puppeteer.launch({
        headless: ConfigProperties.HEADLESS
    });
    const page = await browser.newPage();

    await page.goto(url);

    let scrappedData = await page.evaluate(() => {
        const result = {};
        result['Scientific Name'] = [document.querySelector('h1').textContent.trim()];

        const h3Elements = Array.from(document.querySelectorAll('h3'));

        for (const h3 of h3Elements) {
            if (h3.textContent.trim() === 'Genus') {
                const nextSibling = h3.nextElementSibling;
                result['Genus'] = nextSibling.childNodes.item(0).textContent.trim();
            }
            else if (h3.textContent.trim() === 'Common Names') {
                const nextSibling = h3.nextElementSibling;
                const commonNames = [];
                for(let i=0; i<nextSibling.childNodes.length;i++){
                    commonNames.push(nextSibling.childNodes.item(i).textContent.trim());
                }
                result['Common Name'] = commonNames;
            }
            else if (h3.textContent.trim() === 'Synonyms') {
                const nextSibling = h3.nextElementSibling;
                const synonymsList = Array.from(nextSibling.querySelectorAll('li')).map(li=> li.textContent);
                result['Other Name'] = synonymsList;
            }

        }

        const pElements = Array.from(document.querySelectorAll('p'));
        for (const p of pElements) {
            const childNodes = p.childNodes;
            if (childNodes.item(0)?.textContent.trim() === 'Distribution') {
                result['Distribution'] = p.textContent.split('Distribution')[1].trim();
            }
            else if (childNodes.item(0)?.textContent.trim() === 'Habitat') {
                result['Habitat'] = p.textContent.split('Habitat')[1].trim();
            }
            else if (childNodes.item(0)?.textContent.trim() === 'USDA Hardiness Zone') {
                const values = p.textContent.split('USDA Hardiness Zone')[1].trim().split('-');
                if(values.length==1){
                    values.push(values[0]);
                }
                result['Hardiness'] = {"min":values[0],"max":values[1],"zone":"USDA"};
            }
            // else if (childNodes.item(0)?.textContent.trim() === 'RHS Hardiness Rating') {
            //     result['RHS Hardiness'] = p.textContent.split('RHS Hardiness Rating')[1].trim();
            // }
            else if (childNodes.item(0)?.textContent.trim() === 'Awards') {
                result['Awards'] = p.textContent.split('Awards')[1].trim();
            }
            else if (childNodes.item(0)?.textContent.trim() === 'Conservation status') {
                result['Conservation status'] = p.textContent.split('Conservation status')[1].trim();
            }

            let varieties = Array.from(document.querySelectorAll(`h3[id]`));

            if (varieties.length > 0) {
                varieties = varieties.map(v=> v.textContent.trim().replaceAll("'",""));
                result['Varieties'] = varieties;
            }
        }
        return result;
    });
    await browser.close();

    return scrappedData;
}

module.exports = {
    scrapeIndexPage,
    scrapePlantPage
}
