const AnyProxy = require('anyproxy');
let internalProxy, additionalProxy;

class ProxyServer {

    /**
     * Internal proxy to inject fingerprint
     * @param {Object} options Object of configuration
     * @param {Boolean} [options.silent=true] Is verbose anyproxy log
     * @param {String} [options.logLevel] Inject-fingerprint level log [silly, debug, warn, error, info], winston levels
     * @param {Number} [options.internalProxyPort=9333] Internal Proxy Port
     * @param {Number} [options.internalProxyWebPort=9334] Internal Proxy Web Interface Port
     * @param {Number} [options.additionalProxyPort=9335] Additional Proxy Port when exist external proxy
     * @param {Number} [options.additionalProxyWebPort=9336] Additional Proxy Web Interface Port when exist external proxy
     * @param {String} [options.externalProxy] External proxy
     * @param {String} [options.fingerPrintPath=/tmp] Path to save fingerprint file
     */
    constructor(options = {}) {
        const defaultOptions = {
            internalProxyPort: 9333,
            internalProxyWebPort: 9334,
            additionalProxyPort: 9335,
            additionalProxyWebPort: 9336,
            fingerPrintPath: '/tmp',
            silent: true
        };
        this.options = Object.assign(defaultOptions, options);
        global.__LOGGER_FINGERPRINT = require('./lib/logger')(this.options.logLevel);
    }

    start() {
        if (!AnyProxy.utils.certMgr.ifRootCAFileExists()) {
            AnyProxy.utils.certMgr.generateRootCA((error, keyPath) => {
                if (!error) {
                    const certDir = require('path').dirname(keyPath);
                    __LOGGER_FINGERPRINT.info(`[proxy-server] The certificate was generated on '${certDir}'`);
                    this._startServer();
                } else {
                    __LOGGER_FINGERPRINT.error(`[proxy-server] An error occurred generating proxy server certificate rootCA: '${error.message}'`, error);
                }
            });
        } else {
            this._startServer();
        }
    }

    close() {
        __LOGGER_FINGERPRINT.info('[proxy-server] Terminating internal proxies');
        internalProxy && internalProxy.close();
        additionalProxy && additionalProxy.close();
    }

    /**
     * @param {Object} options Driver options
     * @param {String} [options.browser=chrome] Browser name
     * @param {String} [options.headless=true] Is Headless
     * @param {String} [options.browserLanguage=en-US] Browser Language
     * @param {String} [options.browserUserAgent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36] Browser User Agent
     * @returns {DriverBuilder} DriverBuilder instance
     */
    DriverBuilder(options = {}) {
        const {
            browser = 'chrome',
            headless = true,
            browserLanguage = 'en-US',
            browserUserAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36',
        } = options;
        this.options.browser = browser;
        this.options.headless = headless;
        this.options.browserLanguage = browserLanguage;
        this.options.browserUserAgent = browserUserAgent;

        const DriverBuilder = require('./lib/driver-builder');
        return new DriverBuilder(this.options);
    }

    _createServer(port, webPort, rule, isAdditional) {
        const { silent } = this.options;
        const options = {
            port,
            rule,
            webInterface: {
                enable: true,
                webPort: webPort
            },
            throttle: 10000,
            forceProxyHttps: true,
            wsIntercept: false,
            dangerouslyIgnoreUnauthorized: true,
            silent
        };

        const proxyServer = new AnyProxy.ProxyServer(options);
        proxyServer.on('ready', () => __LOGGER_FINGERPRINT.info(`[proxy-server] Built-in proxy server for script injection ${isAdditional ? 'ADICIONAL ' : ''}iniciado na porta '${port}' | Interface na porta '${webPort}'`));
        proxyServer.on('error', error => __LOGGER_FINGERPRINT.error(`[proxy-server] ${isAdditional ? 'ADICIONAL ' : ''} Houve um erro com o servidor de proxy interno: ${error.message}`, error));
        return proxyServer;
    }

    _startServer() {
        const { internalProxyPort, internalProxyWebPort, additionalProxyPort, additionalProxyWebPort, externalProxy, fingerPrintPath } = this.options;
        const injectFingerPrint = require('./inject-finger-print')(fingerPrintPath);
        const injectByPassServer = require('./inject-by-pass-server')(externalProxy);
        internalProxy = this._createServer(internalProxyPort, internalProxyWebPort, injectFingerPrint);
        internalProxy.start();
        if (externalProxy) {
            additionalProxy = this._createServer(additionalProxyPort, additionalProxyWebPort, [injectFingerPrint, injectByPassServer], true);
            additionalProxy.start();
        }
    }

}

module.exports = ProxyServer;