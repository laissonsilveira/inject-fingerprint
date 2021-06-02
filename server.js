const AnyProxy = require('anyproxy');
const options = {
    port: 8001,
    rule: require('./rule-change-body'),
    webInterface: {
        enable: true,
        webPort: 8002
    },
    throttle: 10000,
    forceProxyHttps: true,
    wsIntercept: false,
    silent: false
};
const proxyServer = new AnyProxy.ProxyServer(options);

proxyServer.on('ready', () => { console.log('Proxy iniciado') });
proxyServer.on('error', (e) => { console.error(e) });
proxyServer.start();

//when finished
// proxyServer.close();