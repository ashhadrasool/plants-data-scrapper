const puppeteer = require("puppeteer");
const ConfigProperties = require("../config/config-properties");

const scrapeIndexPage = async function(url){
    const browser = await puppeteer.launch({
        headless: ConfigProperties.HEADLESS
    });
    const page = await browser.newPage();

    await page.goto('https://pfaf.org/user/', { waitUntil: 'domcontentloaded' });

    await page.click(`a[href="${url.split('/User/')[1].slice(0,-1)}"]`);

    await page.waitForSelector('table[id="ContentPlaceHolder1_gvresults"]');

    await page.evaluate(() => {
        return new Promise(resolve => {
            setTimeout(resolve, 5000); // 10000 milliseconds (10 seconds)
        });
    });

    urls = await page.evaluate(() => {
        const table = document.querySelector('table[id="ContentPlaceHolder1_gvresults"]');
        const anchors = document.querySelectorAll('[href]');
        const array =  Array.from(anchors, (a) => a.href);

        return array.filter(url => url && url.includes('https://pfaf.org/user/Plant.aspx?LatinName=')).sort();
    });

    console.log(urls.length);

    await browser.close();
    return urls;
}

const scrapePlantPage = async function(url) {
    const browser = await puppeteer.launch({
        headless: ConfigProperties.HEADLESS
    });
    const page = await browser.newPage();
    await page.goto(url);

    let scrappedData = await page.evaluate(() => {
        const result = {};

        const tableRows = Array.from(document.querySelectorAll('.table tbody tr'));
        tableRows.forEach((row) => {
            const cells = Array.from(row.querySelectorAll('td'));
            const key = cells[0].textContent.trim();
            const value = cells[1].textContent.trim();

            const keys = ['Common Name', 'Family', 'Habitats', 'USDA hardiness', 'Known Hazards', 'Range', 'Weed Potential'];
            if(keys.includes(key)){
                result[key] = value;
            }else if(key.includes('Rating')){
                result[key] = parseInt(value.split(' of 5)')[0].substring(1));
            }
        });

        const imgElements = document.querySelectorAll('#ContentPlaceHolder1_tblPlantImges img');
        result['Images Urls'] = Array.from(imgElements, (img) => img.getAttribute('src').replace('../', 'https://pfaf.org/'));

        const element = document.querySelector('#ContentPlaceHolder1_lbldisplatinname');
        result['Scientific Name'] = [element.textContent.trim()];

        const h2Elements = Array.from(document.querySelectorAll('h2'));
        for (const h2 of h2Elements) {
            if (h2.textContent.trim() === 'Physical Characteristics') {
                const element = document.querySelector('#ContentPlaceHolder1_lblPhystatment');
                result['Physical Characteristics'] = element.textContent.trim();
                result['Dimensions'] = parseFloat(element.textContent.trim().split('growing to ')[1].split(' m')[0]) + ' meter';
            }
            if (h2.textContent.trim() === 'Synonyms') {
                const element = document.querySelector('#ContentPlaceHolder1_lblSynonyms');
                result['Synonyms'] = element.textContent.trim();
            }
            else if (h2.textContent.trim() === 'Habitats') {
                const nextSibling = h2.nextElementSibling;
                result['Other Habitats'] = nextSibling.textContent.trim();
            }
            else if (h2.textContent.trim() === 'Edible Uses') {
                const nextSibling = h2.nextElementSibling;

                const textElement = document.querySelector('#ContentPlaceHolder1_txtEdibleUses');
                const text = textElement.innerHTML;

                // Split the text by <br> tags and return the last part
                const parts = text.split('<br>');
                const lastPart = parts[parts.length - 1];
                console.log('lastPart', lastPart);

                result['Edible Uses'] = nextSibling.textContent.trim();
            }
            else if (h2.textContent.trim() === 'Medicinal Uses') {
                const nextSibling = h2.nextElementSibling;
                result['Medical Uses'] = nextSibling.textContent.trim();
            }
            else if (h2.textContent.trim() === 'Other Uses') {
                const pElement = document.querySelector('#ContentPlaceHolder1_txtOtherUses');
                result['Other Uses'] = pElement.textContent.trim();

                const specialUsesElement = document.querySelector('#ContentPlaceHolder1_txtSpecialUses');
                result['Special Uses'] = specialUsesElement.textContent.trim();
            }
            else if (h2.textContent.trim() === 'Cultivation details') {
                const element = document.querySelector('#ContentPlaceHolder1_txtCultivationDetails');
                result['Cultivation Details'] = element.textContent.trim();
            }
            else if (h2.textContent.trim() === 'Propagation') {
                const element = document.querySelector('#ContentPlaceHolder1_txtPropagation');
                result['Propagation'] = element.textContent.trim();
            }
            else if (h2.textContent.trim() === 'Other Names') {
                const nextSibling = h2.nextElementSibling;
                result['Other Names'] = nextSibling.textContent.trim();
            }
            else if (h2.textContent.trim() === 'Native Plant Search') {
                const nextSibling = h2.nextElementSibling;
                result['Native Plant Search'] = nextSibling.textContent.trim();
            }
            else if (h2.textContent.trim() === 'Found In') {
                const nextSibling = h2.nextElementSibling;
                result['Found In'] = nextSibling.textContent.trim();
            }
            else if (h2.textContent.trim() === 'Weed Potential') {
                const nextSibling = h2.nextElementSibling;
                result['Weed Potential'] = nextSibling.textContent.trim();
            }
            else if (h2.textContent.trim() === 'Conservation Status') {
                const nextSibling = h2.nextElementSibling;
                result['Conservation Status'] = nextSibling.textContent.trim();
            }
            else if (h2.textContent.trim() === 'Botanical References') {
                const nextSibling = h2.nextElementSibling;
                result['Botanical References'] = nextSibling.textContent.trim();
            }

        }

        return result;
    });

    await browser.close();

    console.log(scrappedData);
    return scrappedData;
}

module.exports = {
    scrapeIndexPage,
    scrapePlantPage
}

