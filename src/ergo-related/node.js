import { get } from './rest';

export const nodeApi = 'http://149.202.46.53:9053';

async function getRequest(url) {
    return get(nodeApi + url).then(res => {
        return { data: res };
    });
}

export async function getLastHeaders() {
    return getRequest('/blocks/lastHeaders/10')
        .then(res => res.data)
}
