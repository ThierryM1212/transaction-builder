import { isDict } from "../utils/utils";
import { boxById, currentHeight } from "./explorer";
import { encodeContract } from "./serializer";

/* global BigInt */

export function parseUtxo(json, addExtention = true, mode = 'input') {
    if (json == undefined) {
        return {};
    }
    var res = {};
    if (mode == 'input') {
        if ("id" in json) {
            res["boxId"] = json.id;
        } else {
            res["boxId"] = json.boxId;
        }
    }
    
    res["value"] = json.value.toString();
    res["ergoTree"] = json.ergoTree;
    res["assets"] = json.assets.map(asset => ({
        tokenId: asset.tokenId,
        amount: asset.amount.toString(),
    }));
    res["additionalRegisters"] = parseAdditionalRegisters(json.additionalRegisters);
    res["creationHeight"] = json.creationHeight;

    if (mode == 'input') {
        if ("txId" in json) {
            res["transactionId"] = json.txId;
        } else {
            res["transactionId"] = json.transactionId;
        }
        res["index"] = json.index;
    }

    if (addExtention) {
        res["extension"] = {};
    }
    return res;
}

export function parseUtxos(utxos, addExtention, mode = 'input') {
    var utxosFixed = [];
    for (const i in utxos) {
        utxosFixed.push(parseUtxo(utxos[i], addExtention, mode))
    }
    return utxosFixed;
}

export async function enrichUtxos(utxos) {
    var utxosFixed = [];
    
    for (const i in utxos) {
        var key = "boxId";
        if ("id" in utxos[i]) {
            key = "id";
        }
        const box = await boxById(utxos[i][key]);
        utxosFixed.push(parseUtxo(box));
    }
    return utxosFixed;
}

function parseAdditionalRegisters(json) {
    var registterOut = {};
    Object.entries(json).forEach(([key, value]) => {
        if (isDict(value)) {
            registterOut[key] = value["serializedValue"];
        } else {
            registterOut[key] = value;
        }
    });
    return registterOut;
}

function parseInputSwagger(input) {
    return {
        boxId: input.boxId,
        extension: {},
    }
}

export function generateSwaggerTx(json) {
    var res = {};
    res.tx = {};
    var newInsputs = [];
    for (const input of json.inputs) {
        newInsputs.push(parseInputSwagger(input));
    }
    res.tx.inputs = newInsputs;
    res.tx.dataInputs = json.dataInputs;
    res.tx.outputs = json.outputs;
    return res;
}


export function getUtxosListValue(utxos) {
    return utxos.reduce((acc, utxo) => acc += BigInt(utxo.value), BigInt(0));
}

export function getTokenListFromUtxos(utxos) {
    var tokenList = {};
    for (const i in utxos) {
        for (const j in utxos[i].assets) {
            if (utxos[i].assets[j].tokenId in tokenList) {
                tokenList[utxos[i].assets[j].tokenId] = parseInt(tokenList[utxos[i].assets[j].tokenId]) + parseInt(utxos[i].assets[j].amount);
            } else {
                tokenList[utxos[i].assets[j].tokenId] = parseInt(utxos[i].assets[j].amount);
            }
        }
    }
    return tokenList;
}

export function getMissingErg(inputs, outputs) {
    const amountIn = getUtxosListValue(inputs);
    const amountOut = getUtxosListValue(outputs);
    if (amountIn >= amountOut) {
        return amountIn - amountOut;
    } else {
        return 0;
    }
}

export function getMissingTokens(inputs, outputs) {
    const tokensIn = getTokenListFromUtxos(inputs);
    const tokensOut = getTokenListFromUtxos(outputs);
    var res = {};
    console.log("getMissingTokens", tokensIn, tokensOut);
    if (tokensIn !== {}) {
        for (const token in tokensIn) {
            if (tokensOut !== {} && token in tokensOut) {
                if (tokensIn[token] - tokensOut[token] > 0) {
                    res[token] = tokensIn[token] - tokensOut[token];
                }
            } else {
                res[token] = tokensIn[token];
            }
        }
    }

    return res;
}

export function buildTokenList(tokens) {
    var res = [];
    console.log("buildTokenList",tokens);
    if (tokens !== {}) {
        for (const i in tokens) {
            res.push({ "tokenId": i, "amount": tokens[i] });
        }
    }
    return res;
}

export async function buildBalanceBox(inputs, outputs, address) {
    const missingErgs = getMissingErg(inputs, outputs).toString();
    const contract = await encodeContract(address);
    const tokens = buildTokenList(getMissingTokens(inputs, outputs));
    const height = await currentHeight();
    console.log("buildBalanceBox",missingErgs,contract,tokens,height)

    return {
        value: missingErgs,
        ergoTree: contract,
        assets: tokens,
        additionalRegisters: {},
        creationHeight: height,
        extension: {}
    };
}
