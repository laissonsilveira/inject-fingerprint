const { join } = require('path');
const { writeFile, existsSync, readFileSync } = require('fs');

const getHardwareConcurrency = () => {
    const hardware = [2, 4, 6, 8];
    return hardware[Math.floor(Math.random() * hardware.length)];
};

const getDeviceMemory = () => {
    const sizeMem = [4, 6, 8, 12];
    return sizeMem[Math.floor(Math.random() * sizeMem.length)];
};

const getIdiomas = function () {
    const idiomas = [
        ['pt-BR', 'en-US', 'en'],
        ['pt-BR', 'en-US', 'en', 'pt'],
        ['pt-BR', 'en-US', 'en', 'pt', 'en-GB'],
        ['pt-BR', 'en-US', 'es', 'en'],
        ['pt-BR', 'en-US', 'es', 'en', 'pt'],
        ['pt-BR', 'en-US', 'es', 'en', 'pt', 'en-GB'],
        ['pt-BR', 'en-US', 'es', 'en-ZA', 'en'],
        ['pt-BR', 'en-US', 'es', 'en-ZA', 'en', 'pt'],
        ['pt-BR', 'en-US', 'es', 'en-ZA', 'en', 'pt', 'en-GB'],
        ['pt-BR', 'es-ES', 'en-US', 'en'],
        ['pt-BR', 'es-ES', 'en-US', 'en', 'pt'],
        ['pt-BR', 'es-ES', 'en-US', 'en', 'pt', 'en-GB'],
        ['pt-BR', 'es-ES', 'en-US', 'es', 'en'],
        ['pt-BR', 'es-ES', 'en-US', 'es', 'en', 'pt'],
        ['pt-BR', 'es-ES', 'en-US', 'es', 'en', 'pt', 'en-GB'],
        ['pt-BR', 'es-ES', 'en-US', 'es', 'en-ZA', 'en'],
        ['pt-BR', 'es-ES', 'en-US', 'es', 'en-ZA', 'en', 'pt'],
        ['pt-BR', 'es-ES', 'en-US', 'es', 'en-ZA', 'en', 'pt', 'en-GB'],
        ['pt-BR', 'es-ES', 'es-CO', 'en-US', 'en'],
        ['pt-BR', 'es-ES', 'es-CO', 'en-US', 'en', 'pt'],
        ['pt-BR', 'es-ES', 'es-CO', 'en-US', 'en', 'pt', 'en-GB'],
        ['pt-BR', 'es-ES', 'es-CO', 'en-US', 'es', 'en'],
        ['pt-BR', 'es-ES', 'es-CO', 'en-US', 'es', 'en', 'pt'],
        ['pt-BR', 'es-ES', 'es-CO', 'en-US', 'es', 'en', 'pt', 'en-GB'],
        ['pt-BR', 'es-ES', 'es-CO', 'en-US', 'es', 'en-ZA', 'en'],
        ['pt-BR', 'es-ES', 'es-CO', 'en-US', 'es', 'en-ZA', 'en', 'pt'],
        ['pt-BR', 'es-ES', 'es-CO', 'en-US', 'es', 'en-ZA', 'en', 'pt', 'en-GB']
    ];
    return idiomas[Math.floor(Math.random() * idiomas.length)];
};

const bypassPlugins = () => {
    return `
    Object.defineProperty(window.navigator, 'plugins', {
        get: function () {
            const pluginData = [
                { name: "Chrome PDF Plugin", filename: "internal-pdf-viewer", description: "Portable Document Format" },
                { name: "Chrome PDF Viewer", filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai", description: "" },
                { name: "Native Client", filename: "internal-nacl-plugin", description: "" },
            ]
            const pluginArray = []
            pluginData.forEach(p => {
                function FakePlugin() { return p }
                const plugin = new FakePlugin()
                Object.setPrototypeOf(plugin, Plugin.prototype);
                pluginArray.push(plugin)
            })
            Object.setPrototypeOf(pluginArray, PluginArray.prototype);
            return pluginArray
        },
    });`;
};

const bypassWebGL = () => {
    return `
    const getParameter = WebGLRenderingContext.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (parameter) {
        // UNMASKED_VENDOR_WEBGL
        if (parameter === 37445) {
            return 'Intel Open Source Technology Center';
        }
        // UNMASKED_RENDERER_WEBGL
        if (parameter === 37446) {
            return 'Mesa DRI Intel(R) Ivybridge Mobile ';
        }

        return getParameter(parameter);
    };`;
};

const bypassPermissions = () => {
    return `
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters));`;
};

const bypassChangeProperties = () => {
    const languages = getIdiomas();
    return `
    function changeProperty(parent, attribute, values) {
        Object.defineProperty(window[parent], attribute, {
            get: function () {
                return values
            }
        });
    }
    this.changeProperty('navigator', 'languages', ${JSON.stringify(languages)})
    this.changeProperty('navigator', 'deviceMemory', ${getDeviceMemory()})
    this.changeProperty('navigator', 'hardwareConcurrency', ${getHardwareConcurrency()})
    this.changeProperty('navigator', 'chrome', { runtime: {}, });
    this.changeProperty('navigator', 'appCodeName', 'Mozilla');
    this.changeProperty('navigator', 'platform', 'Linux x86_64');
    this.changeProperty('navigator', 'vendor', 'Google Inc.');
    this.changeProperty('navigator', 'appName', 'Netscape');
    this.changeProperty('window', 'chrome', { runtime: {}, });
    this.changeProperty('screen', 'colorDepth', 24);`;
};

const bypassWebdriver = () => {
    return 'delete navigator.__proto__?.webdriver;';
};

const createFingerPrintScript = () => {
    return `${bypassPlugins()}
    ${bypassChangeProperties()}
    ${bypassPermissions()}
    ${bypassWebGL()}
    ${bypassWebdriver()}`;
};

const getFingerPrintPath = (name, outDir) => {
    return join(outDir, `${name}.js`);
};

const loadFingerPrint = function (name, outDir) {
    const fingerPrintPath = getFingerPrintPath(name, outDir);
    __LOGGER_FINGERPRINT.info(`[finger-print-builder.js] Loading fingerprint file '${fingerPrintPath}' for proxy rule`);
    if (existsSync(fingerPrintPath)) {
        try {
            return readFileSync(fingerPrintPath, 'utf8');
        } catch (err) {
            __LOGGER_FINGERPRINT.error(`[finger-print-builder.js] Error reading file contents: '${fingerPrintPath}' - ${err?.message}`);
        }
    }
    return createFingerPrint(fingerPrintPath);
};

const createFingerPrint = (fingerPrintPath) => {
    const fingerPrintScript = createFingerPrintScript();
    writeFile(fingerPrintPath, fingerPrintScript, function (err) {
        if (err)
            return __LOGGER_FINGERPRINT.error(`[finger-print-builder.js] Error creating fingerprint file '${fingerPrintPath}' - ${err?.message}`);
        __LOGGER_FINGERPRINT.info(`[finger-print-builder.js] The file '${fingerPrintPath}' was successfully saved!`);
    });
    return fingerPrintScript;
};

module.exports = { loadFingerPrint };