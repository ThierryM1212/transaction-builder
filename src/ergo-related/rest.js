export async function post(url, body = {}, apiKey = '') {
    console.log("post",url)
    return await fetch(url, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'api_key': apiKey,
            'mode': 'cors',

        },
        body: JSON.stringify(body)
    });
}
export async function get(url, apiKey = '') {
    return await fetch(url, {
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            api_key: apiKey,
        },
    }).then(res => res.json());
}
