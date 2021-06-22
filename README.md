[![Node.js CI - TESTS](https://github.com/laissonsilveira/inject-fingerprint/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/laissonsilveira/inject-fingerprint/actions/workflows/node.js.yml)
![GitHub package.json version](https://img.shields.io/github/package-json/v/laissonsilveira/inject-fingerprint)
![node-current](https://img.shields.io/node/v/inject-fingerprint)
[![Downloads](https://img.shields.io/npm/dm/inject-fingerprint.svg)](https://npmjs.com/inject-fingerprint)

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

If `anyproxy` module log is verbose

##### logLevel

Type: `string`\
Default: `null`

Level log of module `inject-fingerprint`. To logging action Ex: [silly, debug, warn, error, info, etc]

**Note:** Winston levels. To log something enter a level.

### start()

Start the proxy

### close()

Close the proxy

### DriverBuilder(options?)

Create and return new web driver

##### browser

Type: `string`\
Default: `chrome`

Browser name. Ex: `chrome`

**Note:** today only works with chrome

##### headless

Type: `boolean`\
Default: `true`

If the init browser in headless mode. Ex: `true|false`

##### browserLanguage

Type: `string`\
Default: `en-US`

Browser Language. <https://developer.mozilla.org/pt-BR/docs/Web/API/NavigatorLanguage>

##### browserUserAgent

Type: `string`\
Default: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36]`

Browser User Agent. <https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Headers/User-Agent>


## Test

`npm test` call the `test/fingerprint.test.js` file and this test open chrome browser mode headless and verify if is robot by test on the site <https://bot.sannysoft.com/>

## Proxy documentation

<https://anyproxy.io/>
