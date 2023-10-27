const puppeteer = require('puppeteer');
const ObjectsToCsv = require('objects-to-csv');

(async () => {
        const browser = await puppeteer.launch({ headless: true});
        const page = await browser.newPage();
        console.log('\n\nWagwan CeejAY!!!\n\nvisiting site now, sit tight...');
        await page.goto('https://www.trafficengland.com/traffic-report');

        // wait for 10 seconds for site to load completely
        console.log('\n\nLet\'s wait for 10 seconds...');
        await page.waitForTimeout(10000)

        console.log('\n\nNow we select "M1" and click on the search button \n\n...and wait for another 10 seconds...');
        await page.select("select.tr-menu-motorway", "M1")
        await page.click('.tr-menu-motorway-search')

        // wait for another 10 seconds for search result to reflect (there's actually a better way to write the wait to cater for network issues but this works just fine)
        await page.waitForTimeout(10000)

        console.log('\n\nNow we extract the table rows and columns data...');
  
        const data = await page.evaluate(() => {
            const tds = Array.from(document.querySelectorAll('#tr-tab-content-0 table tbody tr td'))

            console.log('\n\nNow we replace any occurences of new line characters with an arrow to indicate junction names\n\n...and we get rid of the table columns returned; that contains empty strings: "" ...');
            // retrieve texts from table columns
            const arr = tds.map(td => td.innerText.replace('\n', ' -> '))

            // get rid of empty string array elements
            return arr.filter(element => {
                return element !== '';
            });
        });

        var listIsNotEmpty = data.length > 0
        console.log(data[213]);
        var canLoop = listIsNotEmpty;
        var i = 0

        var objList = []

        console.log('\n\nOkay!, we are almost done.\n\nNow creating objects from the array of strings returned from the table rows & columns for our csv file...');

        // loop through string array and create object and push to objList
        while(canLoop) {
            let obj = {'northbound': data[i], 'northbound speed': data[i+2], 'southbound': data[i+1], 'southbound speed': data[i+3]};
            objList.push(obj)

            // stop loop when at last junction
            if(i+1 >= data.length - 3) {
                canLoop = false
            }
            i = i + 4
        }

        console.log('\n\n...Writing to csv file...');

        const name = 'traffic-data-' + Date.now() +'.csv'

        const csv = new ObjectsToCsv(objList)
        await csv.toDisk('./data/' + name)

        console.log('\n\nProcess completed! csv file is located at: ./data/' + name);

        console.log('\n\n...See you another time...\n\n');

        await browser.close();
})();