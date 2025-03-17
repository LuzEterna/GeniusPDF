const puppeteer = require('puppeteer');


async function GetAnnotion(id) {
    console.log("API: annotation requested: "+id)

    var req = await fetch(`https://genius.com/api/annotations/${id}`)
    var json = await req.json()
    return json.response
}

async function GetGeniusBody(url) { //html crawler
    console.log("API: song page requested: "+ url)
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setJavaScriptEnabled(true);  

    //prevents the loading of components other than script tags.
    await page.setRequestInterception(true);
    page.on('request', request => {
        if (['image', 'stylesheet', 'font', 'script', 'xhr', 'fetch'].includes(request.resourceType())) {
            request.abort(); 
        } else {
            request.continue();
        }
    });
    
    page.on("console", (msg) => console.log("Browser Logs (ignore it):", msg.text()));

    await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        "Accept": "*/*"
    });
    await page.setBypassCSP(true);


    await page.goto(url, { method: 'GET', waitUntil: 'domcontentloaded' });
    var state = await page.evaluate(() => window.__PRELOADED_STATE__);

    await browser.close();
    return state;
    //return require("./preload.json") // for test
}

exports = module.exports = {
    GetAnnotion,
    GetGeniusBody
}