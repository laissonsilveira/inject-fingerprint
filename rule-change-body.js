module.exports = {
    summary: 'Altera HTML',
    *beforeSendResponse(requestDetail, responseDetail) {
        const newResponse = responseDetail.response;
        if (requestDetail?.url.includes('facebook.com')) {
            if (newResponse.body) {
                const { body } = newResponse;
                const myScript = '<script>window.navigator.teste = "laisson"</script>';
                newResponse.body = Buffer.from(body.toString().replace('<head>', `<head>${myScript}`));
            }
        } else {
            if (newResponse.body)
                newResponse.body += 'Laisson';
        }
        return new Promise((resolve, reject) => {
            resolve({ response: newResponse });
        });
    },
}