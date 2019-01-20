const puppeteer = require("puppeteer");
const { toMatchImageSnapshot } = require('jest-image-snapshot');
expect.extend({ toMatchImageSnapshot });

// https://www.npmjs.com/package/jest-image-snapshot
const diffConfig = { threshold: 0.5 }; // 0.5% difference is OK
var browser, page;

(async () => {
    console.log("launching chromium");
    browser = await puppeteer.launch();
    page = await browser.newPage();
})();

describe('DEMO tests', async () => {

    beforeAll(async () => {
        console.log("beforeAll");
        browser = await puppeteer.launch();
        page = await browser.newPage();

    });

    test('demo-basic', async () => {
        console.log("demo-basic");
        expect.assertions(1);

        await page.goto('https://devbab/GitHub/heremap/demo/demo-basic.html');
        await page.waitFor(4000);

        const screenshot = await page.screenshot();
        expect(screenshot).toMatchImageSnapshot({ customDiffConfig: diffConfig });
    }, 60000);

    console.log("in between");

    test('demo-markers', async () => {
        console.log("demo-markers");
        expect.assertions(1);

        await page.goto('https://devbab/GitHub/heremap/demo/demo-markers.html');
        await page.waitFor(5000);

        const screenshot = await page.screenshot();
        expect(screenshot).toMatchImageSnapshot({ customDiffConfig: diffConfig });
    }, 60000);

    console.log("That's it folks");


    afterAll(() => {
        console.log("afterAll");
        browser.close();

    }, 1000);
});







