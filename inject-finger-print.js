/*eslint require-yield: off*/
module.exports = {
    summary: 'Change html body',
    *beforeSendResponse(requestDetail, responseDetail) {
        const newResponse = responseDetail.response;
        if (newResponse?.statusCode === 200 && newResponse?.header['Content-Type']?.includes('text/html') && newResponse?.body) {
            const { body } = newResponse;
            const myScript = `<script>${fingerPrint}</script>`;

            const bodyStr = body?.toString();
            if (bodyStr?.includes('<head>'))
                newResponse.body = Buffer.from(bodyStr.replace('<head>', `<head>${myScript}`));
            else
                console.log(`[inject-finger-print] Não foi encontrado a tag <head> para injetar os scripts na resposta da URL: '${requestDetail?.url}'`);
        }
        return new Promise((resolve) => {
            resolve({ response: newResponse });
        });
    }
};