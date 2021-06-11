/*eslint require-yield: off*/
const HttpsProxyAgent = require('https-proxy-agent');

module.exports = {
    summary: 'Redireciona para o servidor de proxy',
    *beforeSendRequest(requestDetail) {
        if (requestDetail.protocol == 'https') {
            const agent = new HttpsProxyAgent('http://host:1234');
            const newRequestOptions = requestDetail.requestOptions;
            newRequestOptions.agent = agent;
            return requestDetail;
        }

        if (requestDetail.protocol == 'http') {
            const newRequestOptions = requestDetail.requestOptions;
            newRequestOptions.path = requestDetail.url;
            newRequestOptions.hostname = 'http://host';
            newRequestOptions.port = '1234';
            return requestDetail;
        }
    }
};