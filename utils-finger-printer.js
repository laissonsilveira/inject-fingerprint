/**
 * Utils by puppeteer-extra - Thank you!
 */
const utils = {};

/**
 * Wraps a JS Proxy Handler and strips it's presence from error stacks, in case the traps throw.
 *
 * The presence of a JS Proxy can be revealed as it shows up in error stack traces.
 *
 * @param {object} handler - The JS Proxy handler to wrap
 */
utils.stripProxyFromErrors = (handler = {}) => {
    const newHandler = {};
    // We wrap each trap in the handler in a try/catch and modify the error stack if they throw
    const traps = Object.getOwnPropertyNames(handler);
    traps.forEach(trap => {
        newHandler[trap] = function () {
            try {
                // Forward the call to the defined proxy handler
                return handler[trap].apply(this, arguments || []);
            } catch (err) {
                // Stack traces differ per browser, we only support chromium based ones currently
                if (!err || !err.stack || !err.stack.includes('at ')) {
                    throw err;
                }

                // When something throws within one of our traps the Proxy will show up in error stacks
                // An earlier implementation of this code would simply strip lines with a blacklist,
                // but it makes sense to be more surgical here and only remove lines related to our Proxy.
                // We try to use a known "anchor" line for that and strip it with everything above it.
                // If the anchor line cannot be found for some reason we fall back to our blacklist approach.

                const stripWithBlacklist = (stack, stripFirstLine = true) => {
                    const blacklist = [
                        `at Reflect.${trap} `, // e.g. Reflect.get or Reflect.apply
                        `at Object.${trap} `, // e.g. Object.get or Object.apply
                        `at Object.newHandler.<computed> [as ${trap}] ` // caused by this very wrapper :-)
                    ];
                    return (
                        err.stack
                            .split('\n')
                            // Always remove the first (file) line in the stack (guaranteed to be our proxy)
                            .filter((line, index) => !(index === 1 && stripFirstLine))
                            // Check if the line starts with one of our blacklisted strings
                            .filter(line => !blacklist.some(bl => line.trim().startsWith(bl)))
                            .join('\n')
                    );
                };

                const stripWithAnchor = (stack, anchor) => {
                    const stackArr = stack.split('\n');
                    anchor = anchor || `at Object.newHandler.<computed> [as ${trap}] `; // Known first Proxy line in chromium
                    const anchorIndex = stackArr.findIndex(line =>
                        line.trim().startsWith(anchor)
                    );
                    if (anchorIndex === -1) {
                        return false; // 404, anchor not found
                    }
                    // Strip everything from the top until we reach the anchor line
                    // Note: We're keeping the 1st line (zero index) as it's unrelated (e.g. `TypeError`)
                    stackArr.splice(1, anchorIndex);
                    return stackArr.join('\n');
                };

                // Special cases due to our nested toString proxies
                err.stack = err.stack.replace(
                    'at Object.toString (',
                    'at Function.toString ('
                );
                if ((err.stack || '').includes('at Function.toString (')) {
                    err.stack = stripWithBlacklist(err.stack, false);
                    throw err;
                }

                // Try using the anchor method, fallback to blacklist if necessary
                err.stack = stripWithAnchor(err.stack) || stripWithBlacklist(err.stack);

                throw err;// Re-throw our now sanitized error
            }
        };
    });
    return newHandler;
};

/**
 * Replace the property of an object in a stealthy way.
 *
 * Note: You also want to work on the prototype of an object most often,
 * as you'd otherwise leave traces (e.g. showing up in Object.getOwnPropertyNames(obj)).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
 *
 * @example
 * replaceProperty(WebGLRenderingContext.prototype, 'getParameter', { value: "alice" })
 * // or
 * replaceProperty(Object.getPrototypeOf(navigator), 'languages', { get: () => ['en-US', 'en'] })
 *
 * @param {object} obj - The object which has the property to replace
 * @param {string} propName - The property name to replace
 * @param {object} descriptorOverrides - e.g. { value: "alice" }
 */
utils.replaceProperty = (obj, propName, descriptorOverrides = {}) => {
    return Object.defineProperty(obj, propName, {
        // Copy over the existing descriptors (writable, enumerable, configurable, etc)
        ...(Object.getOwnPropertyDescriptor(obj, propName) || {}),
        // Add our overrides (e.g. value, get())
        ...descriptorOverrides
    });
};

/**
 * Preload a cache of function copies and data.
 *
 * For a determined enough observer it would be possible to overwrite and sniff usage of functions
 * we use in our internal Proxies, to combat that we use a cached copy of those functions.
 *
 * Note: Whenever we add a `Function.prototype.toString` proxy we should preload the cache before,
 * by executing `utils.preloadCache()` before the proxy is applied (so we don't cause recursive lookups).
 *
 * This is evaluated once per execution context (e.g. window)
 */
utils.preloadCache = () => {
    if (utils.cache) {
        return;
    }
    utils.cache = {
        // Used in our proxies
        Reflect: {
            get: Reflect.get.bind(Reflect),
            apply: Reflect.apply.bind(Reflect)
        },
        // Used in `makeNativeString`
        nativeToStringStr: Function.toString + '' // => `function toString() { [native code] }`
    };
};

/**
 * Utility function to generate a cross-browser `toString` result representing native code.
 *
 * There's small differences: Chromium uses a single line, whereas FF & Webkit uses multiline strings.
 * To future-proof this we use an existing native toString result as the basis.
 *
 * The only advantage we have over the other team is that our JS runs first, hence we cache the result
 * of the native toString result once, so they cannot spoof it afterwards and reveal that we're using it.
 *
 * @example
 * makeNativeString('foobar') // => `function foobar() { [native code] }`
 *
 * @param {string} [name] - Optional function name
 */
utils.makeNativeString = (name = '') => {
    return utils.cache.nativeToStringStr.replace('toString', name || '');
};


/**
 * Redirect toString requests from one object to another.
 *
 * @param {object} proxyObj - The object that toString will be called on
 * @param {object} originalObj - The object which toString result we wan to return
 */
utils.redirectToString = (proxyObj, originalObj) => {
    const handler = {
        apply: function (target, ctx) {
            // This fixes e.g. `HTMLMediaElement.prototype.canPlayType.toString + ""`
            if (ctx === Function.prototype.toString) {
                return utils.makeNativeString('toString');
            }

            // `toString` targeted at our proxied Object detected
            if (ctx === proxyObj) {
                const fallback = () =>
                    originalObj && originalObj.name
                        ? utils.makeNativeString(originalObj.name)
                        : utils.makeNativeString(proxyObj.name);

                // Return the toString representation of our original object if possible
                return originalObj + '' || fallback();
            }

            // Check if the toString protype of the context is the same as the global prototype,
            // if not indicates that we are doing a check across different windows., e.g. the iframeWithdirect` test case
            const hasSameProto = Object.getPrototypeOf(
                Function.prototype.toString
            ).isPrototypeOf(ctx.toString); // eslint-disable-line no-prototype-builtins
            if (!hasSameProto) {
                // Pass the call on to the local Function.prototype.toString instead
                return ctx.toString();
            }

            return target.call(ctx);
        }
    };

    const toStringProxy = new Proxy(
        Function.prototype.toString,
        utils.stripProxyFromErrors(handler)
    );
    utils.replaceProperty(Function.prototype, 'toString', {
        value: toStringProxy
    });
};

/**
 * All-in-one method to replace a property with a JS Proxy using the provided Proxy handler with traps.
 *
 * Will stealthify these aspects (strip error stack traces, redirect toString, etc).
 * Note: This is meant to modify native Browser APIs and works best with prototype objects.
 *
 * @example
 * replaceWithProxy(WebGLRenderingContext.prototype, 'getParameter', proxyHandler)
 *
 * @param {object} obj - The object which has the property to replace
 * @param {string} propName - The name of the property to replace
 * @param {object} handler - The JS Proxy handler to use
 */
utils.replaceWithProxy = (obj, propName, handler) => {
    const originalObj = obj[propName];
    const proxyObj = new Proxy(obj[propName], utils.stripProxyFromErrors(handler));

    utils.replaceProperty(obj, propName, { value: proxyObj });
    utils.redirectToString(proxyObj, originalObj);

    return true;
};

utils.preloadCache();