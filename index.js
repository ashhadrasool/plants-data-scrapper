const puppeteer = require('puppeteer');

async function scrapPfafWebsite() {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    // const url = 'https://pfaf.org/user/DatabaseSearhResult.aspx?LatinName=A%';
    // await page.goto(url);
    //
    // let hrefs = await page.evaluate(() => {
    //     const anchors = document.querySelectorAll('#ContentPlaceHolder1_gvresults a');
    //     const array =  Array.from(anchors, (a) => a.href);
    //
    //     return array.filter(url => url.startsWith('http'));
    // });
    //
    // hrefs = hrefs.slice(0,1);
    //
    // console.log(hrefs);

    hrefs = ['https://pfaf.org/User/Plant.aspx?LatinName=Pteridium+aquilinum'];

    for(let i =0; i<hrefs.length; i++){
        await page.goto(hrefs[i]);

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
            result['Scientific Name'] = element.textContent.trim();

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

        console.log(scrappedData);
    }

    await browser.close();
}

async function scrapeWebsite(){
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();

    // await page.goto('https://www.treesandshrubsonline.org/articles');
    //
    // const urls = await page.evaluate(() => {
    //     const hrefs = [];
    //
    //     const plantElements = document.querySelector('.uk-grid.uk-grid-stack');
    //
    //     const anchorElements = Array.from(plantElements.querySelectorAll('a'));
    //
    //     anchorElements.forEach(anchor => {
    //         const href = anchor.getAttribute('href');
    //         if (href && !href.includes('#')) {
    //             count = href.split('/').length;
    //             if(count==5){
    //                 hrefs.push('https://www.treesandshrubsonline.org'+href);
    //             }
    //
    //         }
    //     });
    //
    //     return hrefs;
    // });
    // console.log(urls);

    const urls = ['https://www.treesandshrubsonline.org/articles/abelia/abelia-chinensis/'];

    const result = [];
    for(let i =0; i<urls.length; i++) {
        await page.goto(urls[i]);
        let scrappedData = await page.evaluate(() => {
            const result = {};
            result['Scientific Name'] = document.querySelector('h1').textContent.trim();

            const h3Elements = Array.from(document.querySelectorAll('h3'));

            for (const h3 of h3Elements) {
                if (h3.textContent.trim() === 'Genus') {
                    const nextSibling = h3.nextElementSibling;
                    result['Genus'] = nextSibling.textContent.trim();
                }
                else if (h3.textContent.trim() === 'Common Names') {
                    const nextSibling = h3.nextElementSibling;
                    result['Common Names'] = nextSibling.textContent.trim();
                }
                else if (h3.textContent.trim() === 'Synonyms') {
                    const nextSibling = h3.nextElementSibling;
                    const synonymsList = Array.from(nextSibling.querySelectorAll('li')).map(li=> li.textContent);
                    result['Synonyms'] = synonymsList;
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
                    result['USDA Hardiness Zone'] = p.textContent.split('USDA Hardiness Zone')[1].trim();
                }
                else if (childNodes.item(0)?.textContent.trim() === 'RHS Hardiness Rating') {
                    result['RHS Hardiness Rating'] = p.textContent.trim();
                }
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
        result.push(scrappedData);
    }
    console.log(result);

    await browser.close();
}

// scrapPfafWebsite();

scrapeWebsite();
