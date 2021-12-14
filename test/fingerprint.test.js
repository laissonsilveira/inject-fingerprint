const { existsSync } = require('fs');
const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const ProxyServer = new (require('../index'))({ logLevel: 'silly' });
let driver, tables;

describe('Page fingerprint application validation test', async () => {

    before(async () => {
        ProxyServer.start();
        driver = ProxyServer.DriverBuilder(ProxyServer.options).build();
        await driver.get('https://bot.sannysoft.com/');
        await driver.wait(until.elementLocated(By.xpath('//*[@id="fp2"]')), 10000);
        tables = await driver.findElements(By.css('table'));
    });

    after(() => {
        ProxyServer.close();
        if (driver) driver.quit();
    });

    it('Should run old fingerprint tests on test page and validate results', async () => {
        await oldFingerPrintValidate(tables);
    });

    it('Should run new fingerprint tests on test page and validate results', async () => {
        await newFingerPrintValidate(tables);
    });

    it('Should clear cache folder', async () => {
        ProxyServer.clearCache(1, 's');
        expect(existsSync('/tmp/anyproxy/cache/')).to.be.false;
    });
});

async function oldFingerPrintValidate(tables) {
    const passedTests = [], failedTests = [];
    const oldFingerprintLines = await tables[0].findElements(By.css('tr'));
    for (const line of oldFingerprintLines) {

        const tds = await line.findElements(By.css('td'));

        if (tds.length == 2) {
            const name = await tds[0].getText();
            const result = await tds[1].getText();

            const passedEls = await line.findElements(By.className('passed'));
            if (passedEls.length != 0)
                passedTests.push({ name, result });

            const failedEls = await line.findElements(By.className('failed'));
            if (failedEls.length != 0)
                failedTests.push({ name, result });
        }
    }
    expect(failedTests, `[FAIL] Old FingerPrint: ${JSON.stringify(failedTests)}`).to.be.empty;
    expect(passedTests.length, '[SUCCESS] Old FingerPrint').to.be.greaterThanOrEqual(12);
}

async function newFingerPrintValidate(tables) {
    const newFingerprintLines = await tables[1].findElements(By.css('tr'));
    const passedTests = [], warnTests = [], failedTests = [];
    for (const line of newFingerprintLines) {
        const tds = await line.findElements(By.css('td'));
        const key = await tds[0].getText();
        const status = await tds[1].getText();
        const value = await tds[2].getText();
        const fingerResult = { key, status, value };

        if (status == 'ok')
            passedTests.push(fingerResult);
        else if (status == 'WARN')
            warnTests.push(fingerResult);
        else
            failedTests.push(fingerResult);
    }

    const explanation = `
    PHANTOM_UA: Detect PhantomJS user agent
    PHANTOM_PROPERTIES: Test the presence of properties introduced by PhantomJS
    PHANTOM_ETSL: Runtime verification for PhantomJS
    PHANTOM_LANGUAGE: Use navigator.languages to detect PhantomJS
    PHANTOM_WEBSOCKET: Analyze the error thrown when creating a websocket
    MQ_SCREEN: Use media query related to the screen
    PHANTOM_OVERFLOW: Analyze error thrown when a stack overflow occurs
    PHANTOM_WINDOW_HEIGHT: Analyze window screen dimension
    HEADCHR_UA: Detect Chrome Headless user agent
    WEBDRIVER: Test the presence of webriver attributes
    HEADCHR_CHROME_OBJ: Test the presence of the window.chrome object
    HEADCHR_PERMISSIONS: Test permissions management
    HEADCHR_PLUGINS: Verify the number of plugins
    HEADCHR_IFRAME: Test presence of Chrome Headless using an iframe
    CHR_DEBUG_TOOLS: Test if debug tools are opened
    SELENIUM_DRIVER: Test the presence of Selenium drivers
    CHR_BATTERY: Test the presence of battery
    CHR_MEMORY: Verify if navigator.deviceMemory is consistent
    TRANSPARENT_PIXEL: Verify if a canvas pixel is transparent`;

    __LOGGER_FINGERPRINT && __LOGGER_FINGERPRINT.info(`[proxy-server] Explanation test new fingerprint: '${explanation}'`);

    if (warnTests) __LOGGER_FINGERPRINT.warn(`[WARN] New FingerPrint: ${JSON.stringify(warnTests)}`);

    expect(failedTests, `[FAIL] New FingerPrint: ${JSON.stringify(failedTests)}`).to.be.empty;
    expect(passedTests.length, '[SUCCESS] New FingerPrint').to.be.greaterThanOrEqual(20);
}