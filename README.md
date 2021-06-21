# inject-fingerprint

Inject fingerprint with proxy.

> Fingerprint (device fingerprint) is a set of techniques that allow a website to uniquely identify your computer.
>
> Calculating a device's fingerprint begins when a user visits a website. The device fingerprint tracker collects all relevant information (version / browser type, OS, etc.). The interaction triggers the collection of a range of data (like the one listed above) that forms a special "hash" assigned to that specific device.
>
> This page tells you how identifiable your browser is as a robot: <https://bot.sannysoft.com/> and this module makes the tests on this page succeed on your chrome headless. See [test](#test)

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

## Test

`npm test` exec `test/fingerprint.test.js` file and this test open chrome browser mode headless and verify if is robo by test on the site <https://bot.sannysoft.com/>

## Proxy documentation

<https://anyproxy.io/>
