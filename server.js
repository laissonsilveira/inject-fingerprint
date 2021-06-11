const AnyProxy = require('anyproxy');
const injectFingerPrint = require('./inject-finger-print');
// const injectByPassServer = require('./inject-by-pass-server');
let internalProxy, redirectToAnotherProxy;

const createServer = (port, webPort, rules, isAdditional) => {
    const options = {
        port,
        rule: rules,
        webInterface: {
            webPort,
            enable: true
        },
        throttle: 10000,
        forceProxyHttps: true,
        wsIntercept: false,
        dangerouslyIgnoreUnauthorized: true,
        silent: true
    };

    const proxyServer = new AnyProxy.ProxyServer(options);
    proxyServer.on('ready', () => console.log(`[proxy-server] Servidor de proxy interno para injeção de scripts ${isAdditional ? 'ADICIONAL ' : ''}iniciado na porta '${port}' | Interface na porta '${webPort}'`));
    proxyServer.on('error', error => console.error(`[proxy-server] ${isAdditional ? 'ADICIONAL ' : ''} Houve um erro com o servidor de proxy interno: ${error.message}`, error));
    return proxyServer;
};

function startServer() {
    internalProxy = createServer(7001, 7002, injectFingerPrint);
    internalProxy.start();
    /**
     * If this proxy need redirect to another proxy
     */
    // redirectToAnotherProxy = createServer(additionalPort, additionalWebPort, [injectFingerPrint, injectByPassServer], true);
    // redirectToAnotherProxy.start();
}

const init = () => {
    if (!AnyProxy.utils.certMgr.ifRootCAFileExists()) {
        AnyProxy.utils.certMgr.generateRootCA((error, keyPath) => {
            if (!error) {
                const certDir = require('path').dirname(keyPath);
                console.log(`[proxy-server] O certificado foi gerado em '${certDir}'`);
                startServer();
            } else {
                console.error(`[proxy-server] Ocorreu um erro na geração do certificado do servidor de proxy rootCA: '${error.message}'`, error);
            }
        });
    } else {
        startServer();
    }
};

const close = () => {
    console.log('[proxy-server] Finalizando proxies internos');
    internalProxy?.close();
    // redirectToAnotherProxy?.close();
};

init();