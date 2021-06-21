/*eslint require-yield: off*/
const HttpsProxyAgent = require('https-proxy-agent');

module.exports = externalProxy => {
    return {
        summary: 'Redirects to proxy server',
        *beforeSendRequest(requestDetail) {
            if (!externalProxy) {
                return requestDetail;
            }

            if (requestDetail.protocol == 'https') {
                const agent = new HttpsProxyAgent(externalProxy);
                const newRequestOptions = requestDetail.requestOptions;
                newRequestOptions.agent = agent;
                return requestDetail;
            }

            if (requestDetail.protocol == 'http') {
                const [address, port] = externalProxy?.split(':');
                const newRequestOptions = requestDetail.requestOptions;
                newRequestOptions.path = requestDetail.url;
                newRequestOptions.hostname = address;
                newRequestOptions.port = port;
                return requestDetail;
            }
        }
    };
};