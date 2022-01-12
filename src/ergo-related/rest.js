import { displayTransaction, errorAlert } from "../utils/Alerts";


export async function post(url, body = {}, apiKey = '') {
    console.log("post",url)
    fetch(url, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'mode': 'cors',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        },
        body: JSON.stringify(body)
    }).then(response => Promise.all([response.ok, response.json()]))
    .then(([responseOk, body]) => {
      if (responseOk) {
          displayTransaction(body)
        return JSON.parse(body);
      } else {
        console.log("fetch2",body);
        errorAlert("Failed to fetch",JSON.stringify(body))
      }
    })
    .catch(error => {
        console.log("fetch3",error);
      // catches error case and if fetch itself rejects
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

function test() {
    fetch('url')
  .then(response => Promise.all([response.ok, response.json()]))
  .then(([responseOk, body]) => {
    if (responseOk) {
      // handle success case
    } else {
      throw new Error(body);
    }
  })
  .catch(error => {
    // catches error case and if fetch itself rejects
  });
}