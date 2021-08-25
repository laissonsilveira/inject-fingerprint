'use strict';
const { join } = require('path');
const { writeFile, existsSync, readFileSync, mkdirSync } = require('fs');

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
this.changeProperty('navigator', 'chrome', { runtime: {} });
this.changeProperty('navigator', 'appCodeName', 'Mozilla');
this.changeProperty('navigator', 'platform', 'Linux x86_64');
this.changeProperty('navigator', 'vendor', 'Google Inc.');
this.changeProperty('navigator', 'appName', 'Netscape');
this.changeProperty('screen', 'colorDepth', 24);
if (!window.chrome) {
    Object.defineProperty(window, 'chrome', {
        get: function () {
            return values
        }
    });
}`;
};

const bypassWebdriver = () => {
    return 'delete navigator.__proto__?.webdriver;';
};

const bypassIframe = () => {
    return `
try {
    // Adds a contentWindow proxy to the provided iframe element
    const addContentWindowProxy = iframe => {
        const contentWindowProxy = {
            get(target, key) {
                // Now to the interesting part:
                // We actually make this thing behave like a regular iframe window,
                // by intercepting calls to e.g. .self and redirect it to the correct thing. :)
                // That makes it possible for these assertions to be correct:
                // iframe.contentWindow.self === window.top // must be false
                if (key === 'self') {
                    return this
                }
                // iframe.contentWindow.frameElement === iframe // must be true
                if (key === 'frameElement') {
                    return iframe
                }
                return Reflect.get(target, key)
            }
        }

        if (!iframe.contentWindow) {
            const proxy = new Proxy(window, contentWindowProxy)
            Object.defineProperty(iframe, 'contentWindow', {
                get() {
                    return proxy
                },
                set(newValue) {
                    return newValue // contentWindow is immutable
                },
                enumerable: true,
                configurable: false
            })
        }
    }

    // Handles iframe element creation, augments srcdoc property so we can intercept further
    const handleIframeCreation = (target, thisArg, args) => {
        const iframe = target.apply(thisArg, args)

        // We need to keep the originals around
        const _iframe = iframe
        const _srcdoc = _iframe.srcdoc

        // Add hook for the srcdoc property
        // We need to be very surgical here to not break other iframes by accident
        Object.defineProperty(iframe, 'srcdoc', {
            configurable: true, // Important, so we can reset this later
            get: function () {
                return _iframe.srcdoc
            },
            set: function (newValue) {
                addContentWindowProxy(this)
                // Reset property, the hook is only needed once
                Object.defineProperty(iframe, 'srcdoc', {
                    configurable: false,
                    writable: false,
                    value: _srcdoc
                })
                _iframe.srcdoc = newValue
            }
        })
        return iframe
    }

    // Adds a hook to intercept iframe creation events
    const addIframeCreationSniffer = () => {
        /* global document */
        const createElementHandler = {
            // Make toString() native
            get(target, key) {
                return Reflect.get(target, key)
            },
            apply: function (target, thisArg, args) {
                const isIframe =
                    args && args.length && String(args[0]).toLowerCase() === 'iframe'
                if (!isIframe) {
                    // Everything as usual
                    return target.apply(thisArg, args)
                } else {
                    return handleIframeCreation(target, thisArg, args)
                }
            }
        }
        // All this just due to iframes with srcdoc bug
        utils.replaceWithProxy(
            document,
            'createElement',
            createElementHandler
        )
    }

    // Let's go
    addIframeCreationSniffer()
} catch (err) {
    // console.warn(err)
}`;
};

const bypassHairlineFeature = () => {
    return `// store the existing descriptor
const elementDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
// redefine the property with a patched descriptor
Object.defineProperty(HTMLDivElement.prototype, 'offsetHeight', {
    ...elementDescriptor,
    get: function () {
        if (this.id === 'modernizr') {
            return 1;
        }
        return elementDescriptor.get.apply(this);
    },
});`;
};

const createFingerPrintScript = () => {
    return `${readFileSync(join(__dirname, './utils-finger-printer.js'))}
    ${bypassPlugins()}
    ${bypassChangeProperties()}
    ${bypassPermissions()}
    ${bypassWebGL()}
    ${bypassIframe()}
    ${bypassWebdriver()}
    ${bypassHairlineFeature()}`;
};

const getFingerPrintPath = (name, outDir) => {
    if (!existsSync(outDir))
        mkdirSync(outDir, { recursive: true });
    return join(outDir, `${name}.js`);
};

const loadFingerPrint = function (name, outDir) {
    const fingerPrintPath = getFingerPrintPath(name, outDir);
    __LOGGER_FINGERPRINT.info(`[finger-print-builder.js] Loading fingerprint file '${fingerPrintPath}' for proxy rule`);
    if (existsSync(fingerPrintPath)) {
        try {
            return readFileSync(fingerPrintPath, 'utf8');
        } catch (err) {
            __LOGGER_FINGERPRINT.error(`[finger-print-builder.js] Error reading file contents: '${fingerPrintPath}' - ${err && err.message}`);
        }
    }
    return createFingerPrint(fingerPrintPath);
};

const createFingerPrint = (fingerPrintPath) => {
    const fingerPrintScript = createFingerPrintScript();
    writeFile(fingerPrintPath, fingerPrintScript, function (err) {
        if (err)
            return __LOGGER_FINGERPRINT.error(`[finger-print-builder.js] Error creating fingerprint file '${fingerPrintPath}' - ${err && err.message}`);
        __LOGGER_FINGERPRINT.info(`[finger-print-builder.js] The file '${fingerPrintPath}' was successfully saved!`);
    });
    return fingerPrintScript;
};

module.exports = { loadFingerPrint };