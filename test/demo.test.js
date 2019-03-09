const puppeteer = require("puppeteer");
const {
    toMatchImageSnapshot
} = require('jest-image-snapshot');
expect.extend({
    toMatchImageSnapshot
});

// https://www.npmjs.com/package/jest-image-snapshot
const diffConfig = {
    threshold: 0.5
}; // 0.5% difference is OK


describe('DEMO Tests', async () => {


    test('demo-basic', async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        expect.assertions(1);

        await page.goto('https://devbab/GitHub/heremap/demo/demo-basic.html?demotest=1');
        await page.waitFor(4000);

        const screenshot = await page.screenshot();
        expect(screenshot).toMatchImageSnapshot({
            customDiffConfig: diffConfig
        });
        await browser.close()
    }, 60000);


    test('demo-markers', async () => {
        const browser = await puppeteer.launch({
            headless: true
        });
        const page = await browser.newPage();
        expect.assertions(1);

        await page.goto('https://devbab/GitHub/heremap/demo/demo-markers.html?demotest=1');
        await page.waitFor(5000);

        const screenshot = await page.screenshot();
        expect(screenshot).toMatchImageSnapshot({
            customDiffConfig: diffConfig
        });
        await browser.close()

    }, 60000);

    test('demo-cluster', async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        expect.assertions(1);

        await page.goto('https://devbab/GitHub/heremap/demo/demo-cluster.html?demotest=1');
        await page.waitFor(10000);
        const screenshot = await page.screenshot();
        expect(screenshot).toMatchImageSnapshot({
            customDiffConfig: diffConfig
        });
        await browser.close()

    }, 60000);



});