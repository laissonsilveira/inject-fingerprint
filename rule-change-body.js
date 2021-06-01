module.exports = {
    summary: 'Altera HTML',
    *beforeSendResponse(requestDetail, responseDetail) {
        const newResponse = responseDetail.response;
        if (newResponse.body)
            newResponse.body += 'Laisson';
        return new Promise((resolve, reject) => {
            resolve({ response: newResponse });
        });
    },
}