'use strict';
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const proxy = require('selenium-webdriver/proxy');
const chromeOptions = new chrome.Options();

class DriverBuilder {

    constructor(options) {
        this.options = options;
        this._setProxy();
    }

    build() {
        let driver;
        if (this.options.browser === 'chrome')
            driver = this._configChromeDriver();
        // else TODO 'Firefox...'
        return driver;
    }

    _setProxy() {
        const { internalProxyPort, additionalProxyPort, externalProxy } = this.options;
        this.proxy = `127.0.0.1:${internalProxyPort}`;
        if (externalProxy) {
            this.proxy = `127.0.0.1:${additionalProxyPort}`;
            __LOGGER_FINGERPRINT.info(`[driver-builder] Collection being done through proxy: ${JSON.stringify(proxy)}`);
        }
    }

    _configChromeDriver() {
        const prefs = { 'safebrowsing.enabled': false };

        let args = [
            // '--disable-notifications',
            '--incognito',
            // '--disable-blink-features=AutomationControlled',
            '--disable-infobars',
            '--ignore-certificate-errors',
            `--lang=${this.options.browserLanguage}`,
            `--user-agent=${this.options.browserUserAgent}`,
            '--disable-dev-shm-usage',
            '--remote-debugging-port=4444'
        ];

        if (this?.options.headless) {
            args = args.concat([
                '--headless',
                '--disable-gpu',
                '--no-sandbox'
            ]);
        }

        chromeOptions
            .setProxy(proxy.manual({
                http: this.proxy,
                https: this.proxy
            }))
            .excludeSwitches(['enable-automation'])
            .addArguments(args)
            .setUserPreferences(prefs);

        return new Builder()
            .forBrowser(this.options.browser)
            .setChromeOptions(chromeOptions)
            .build();
    }

}

module.exports = DriverBuilder;