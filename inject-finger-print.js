'use strict';
/*eslint require-yield: off*/
const { loadFingerPrint } = require('./finger-print-builder');
const { join } = require('path');

module.exports = directory => {
    const fingerPrint = loadFingerPrint('default', join(directory, require('./package.json').version));
    const fingerPrintScript = `<script>${fingerPrint}</script>`;
    return {
        summary: 'FingerPrint Scripts Injection ',
        *beforeSendResponse(requestDetail, responseDetail) {
            const newResponse = responseDetail.response;
            if (newResponse
                && newResponse.statusCode === 200
                && newResponse.header['Content-Type']
                && newResponse.header['Content-Type'].includes('text/html')
                && newResponse.body) {

                const { body } = newResponse;
                if (body && body.includes('<head>')) {
                    const encode = body.includes('charset="iso-8859-1"') || body.includes('charset="ISO-8859-1"') ? 'latin1' : 'utf8';
                    newResponse.body = Buffer.from(body.toString(encode).replace('<head>', `<head>${fingerPrintScript}`), encode);
                }
                else
                    __LOGGER_FINGERPRINT.silly(`[inject-finger-print] Could not find <head> tag to inject scripts in URL response: '${requestDetail && requestDetail.url}'`);
            }
            return new Promise((resolve) => {
                resolve({ response: newResponse });
            });
        }
    };
};