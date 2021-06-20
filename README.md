# inject-fingerprint

Inject fingerprint with proxy

## Install

```
npm install
```

## Usage

```js
const InjectFingerprint = require('inject-fingerprint');
const ProxyServer = new InjectFingerprint();
// To start proxy
ProxyServer.start();
// To close proxy
ProxyServer.close();
```

## API

### InjectFingerprint(options?)

Create Internal proxy to inject fingerprint

#### options

Type: `object`

##### internalProxyPort

Type: `number`\
Default: `9333`

Internal Proxy Port

##### internalProxyWebPort

Type: `number`\
Default: `9334`

Internal Proxy Web Interface Port

##### additionalProxyPort

Type: `number`\
Default: `9335`

Additional Proxy Port when exist external proxy

##### additionalProxyWebPort

Type: `number`\
Default: `9336`

Additional Proxy Web Interface Port when exist external proxy

##### externalProxy

Type: `string`

External proxy. Ex: `http://host:port`

##### fingerPrintPath

Type: `string`\
Default: `/tmp`

Path to save fingerprint file.

**Note:** The name of file is `default`, you can change the script if you want. If file exist, it is loaded, else created.

##### silent

Type: `boolean`\
Default: `true`

Is verbose proxy log

## Proxy documentation

<https://anyproxy.io/>
