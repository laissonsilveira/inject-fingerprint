const moment = require('moment');
const { writeFileSync } = require('fs');
const { join } = require('path');
const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const ProxyServer = new (require('../index'))({ logLevel: 'silly' });
let driver;

describe('Teste de validação de aplicação de fingerprint em página', async () => {

    before(() => {
        ProxyServer.start();
        driver = ProxyServer.DriverBuilder(ProxyServer.options).build();
    });
    after(() => {
        ProxyServer.close();
        if (driver) driver.quit();
    });

    it('Roda testes de fingerprint em página de teste e valida resultados', async () => {
        await driver.get('https://bot.sannysoft.com/');
        await driver.wait(until.elementLocated(By.xpath('//*[@id="fp2"]')), 10000);
        await new Screenshot(driver).take('test');
        const tables = await driver.findElements(By.css('table'));
        await oldFingerPrintValidate(tables);
        await newFingerPrintValidate(tables);
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
            if (failedEls.length != 0 && !name.includes('Hairline Feature'))//Bypass desnessário
                failedTests.push({ name, result });
        }
    }
    expect(failedTests, `[FALHA] Old FingerPrint: ${JSON.stringify(failedTests)}`).to.be.empty;
    expect(passedTests.length, '[SUCESSO] Old FingerPrint').to.be.equal(11);
}

async function newFingerPrintValidate(tables) {
    const newFingerprintLines = await tables[1].findElements(By.css('tr'));
    const passedTests = [], failedTests = [];
    for (const line of newFingerprintLines) {
        const tds = await line.findElements(By.css('td'));
        const key = await tds[0].getText();
        if (key === 'HEADCHR_IFRAME') continue;//Sem bypass por enquanto
        const status = await tds[1].getText();
        const value = await tds[2].getText();
        const fingerResult = { key, status, value };

        if (status == 'ok')
            passedTests.push(fingerResult);

        else
            failedTests.push(fingerResult);
    }

    expect(failedTests, `[FALHA] New FingerPrint: ${JSON.stringify(failedTests)}`).to.be.empty;
    expect(passedTests.length, '[SUCESSO] New FingerPrint').to.be.equal(20);
}

class Screenshot {

    constructor(driver) {
        this.driver = driver;
    }

    /**
     * @param {String} path Path to save photo
     * @returns {Promise}
     */
    async take(path = './') {
        try {
            await this._setBackground();
            const image = await this.driver.takeScreenshot();
            const fileName = moment().format('YYYY-MM-DD_HH-mm-ss') + '.png';
            writeFileSync(join(path, fileName), image.replace(/^data:image\/png;base64,/, ''), 'base64');
            __LOGGER_FINGERPRINT.info(`[screenshot] Screenshot => '${fileName}'`);
            return fileName;
        } catch (err) {
            __LOGGER_FINGERPRINT.warn('[screenshot] Não foi possível salvar screenshot: ' + err.message);
        }
    }

    async _setBackground() {
        /* istanbul ignore next */
        await this.driver.executeScript(function () {
            const style = document.createElement('style'),
                text = document.createTextNode('body { background: #fff }');
            style.setAttribute('type', 'text/css');
            style.appendChild(text);
            document.head.insertBefore(style, document.head.firstChild);
        });
    }
}