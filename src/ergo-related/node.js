import { get, post } from './rest';

// in order to secure the node requests (port 9053) the following setting have been done on apache
// prevent any connection to 9053 except from localhost
// proxy https://transaction-builder.ergo.ga/blocks to http://localhost:9053/blocks/lastHeaders/10

export const nodeApi = 'https://transaction-builder.ergo.ga';

async function getRequest(url) {
    return get(nodeApi + url).then(res => {
        return { data: res };
    });
}

async function postRequest(url, body = {}, apiKey = '') {
    return post(nodeApi + url, body).then(res => {
        return { data: res };
    });
}

export async function getLastHeaders() {
    return await getRequest('/blocks/')
        .then(res => res.data)
}

export async function sendTx(json) {
    console.log(json);
    return await postRequest('/transactions/', JSON.parse(json) )
        .then(res => res.data)
}
