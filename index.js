const puppeteer = require('puppeteer');

async function scrapWebsite() {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    const url = 'https://pfaf.org/user/DatabaseSearhResult.aspx?LatinName=A%';
    await page.goto(url);

    let hrefs = await page.evaluate(() => {
        const anchors = document.querySelectorAll('#ContentPlaceHolder1_gvresults a');
        const array =  Array.from(anchors, (a) => a.href);

        return array.filter(url => url.startsWith('http'));
    });

    hrefs = hrefs.slice(0,1);

    console.log(hrefs);

    for(let i =0; i<hrefs.length; i++){
        await page.goto(hrefs[i]);

        let tableData = await page.evaluate(() => {
            const tableRows = Array.from(document.querySelectorAll('.table tbody tr'));

            const scrapedData = {};
            tableRows.forEach((row) => {
                const cells = Array.from(row.querySelectorAll('td'));
                const key = cells[0].textContent.trim();
                const value = cells[1].textContent.trim();

                const keys = ['Common Name', 'Family', 'Habitats', 'USDA hardiness', 'Known Hazards', 'Range', 'Weed Potential'];
                if(keys.includes(key)){
                    scrapedData[key] = value;
                }else if(key.includes('Rating')){
                    scrapedData[key] = parseInt(value.split(' of 5)')[0].substring(1));
                }
            });

            return scrapedData;
        });

        const imageUrls = await page.evaluate(() => {
            const imgElements = document.querySelectorAll('#ContentPlaceHolder1_tblPlantImges img');
            return Array.from(imgElements, (img) => img.getAttribute('src').replace('../', 'https://pfaf.org/'));
        });


        console.log(tableData);

        restData = await page.evaluate(() => {
            result = {};

            const element = document.querySelector('#ContentPlaceHolder1_lbldisplatinname');
            result['Scientific Name'] = element.textContent.trim();

            const h2Elements = Array.from(document.querySelectorAll('h2'));
            for (const h2 of h2Elements) {
                if (h2.textContent.trim() === 'Physical Characteristics') {
                    const element = document.querySelector('#ContentPlaceHolder1_lblPhystatment');
                    result['Physical Characteristics'] = element.textContent.trim();
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

        const output = {...tableData, 'Image Urls': imageUrls, ...restData};

        console.log(output);
    }


    await browser.close();
}

scrapWebsite();
