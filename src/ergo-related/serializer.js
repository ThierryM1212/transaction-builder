import {Serializer} from "@coinbarn/ergo-ts";
import JSONBigInt from 'json-bigint';
import { getLastHeaders } from "./node";


let ergolib = import('ergo-lib-wasm-browser')

export async function encodeNum(n, isInt = false) {
    if (isInt) return (await ergolib).Constant.from_i32(n).encode_to_base16()
    else return (await ergolib).Constant.from_i64((await ergolib).I64.from_str(n)).encode_to_base16()
}

export async function decodeNum(n, isInt = false) {
    if (isInt) return (await ergolib).Constant.decode_from_base16(n).to_i32()
    else return (await ergolib).Constant.decode_from_base16(n).to_i64().to_str()

}

function byteArrayToBase64( byteArray ) {
    var binary = '';
    var len = byteArray.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( byteArray[ i ] );
    }
    return window.btoa( binary );
}

function base64ToByteArray(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}

export async function encodeHex(reg) {
    return (await ergolib).Constant.from_byte_array(Buffer.from(reg, 'hex')).encode_to_base16()
}

export async function encodeStr(str) {
    return encodeHex(Serializer.stringToHex(str))
}

function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

export async function decodeString(encoded) {
    return Serializer.stringFromHex(toHexString((await ergolib).Constant.decode_from_base16(encoded).to_byte_array()))
}

export function ergToNano(erg) {
    if (erg === undefined) return 0
    if (erg.startsWith('.')) return parseInt(erg.slice(1) + '0'.repeat(9 - erg.length + 1))
    let parts = erg.split('.')
    if (parts.length === 1) parts.push('')
    if (parts[1].length > 9) return 0
    return parseInt(parts[0] + parts[1] + '0'.repeat(9 - parts[1].length))
}

export async function encodeAddress(address) {
    const byteArray = (await ergolib).Address.from_mainnet_str(address).to_bytes();
    return (await ergolib).Constant.from_byte_array(byteArray);
}

export async function decodeAddress(addr) {
    const address = (await ergolib).Address.from_bytes(addr);
    return address.to_base58();
}

export async function encodeInt(num) {
    return (await ergolib).Constant.from_i32(num);
}
export async function decodeInt(num) {
    return num.to_i32();
}

export async function encodeLong(num) {
    return (await ergolib).Constant.from_i64((await ergolib).I64.from_str(num));
}
export async function decodeLong(num) {
    return num.to_i64().to_str();
}

export async function encodeLongArray(longArray) {
    return (await ergolib).Constant.from_i64_str_array(longArray);
}

export async function decodeLongArray(encodedArray) {
    return encodedArray.to_i64_str_array();
}

export async function decodeLongArray2(encodedArray) {
    const tmp = (await ergolib).Constant.from_i64_str_array(encodedArray);
    return tmp.to_i64_str_array();
}

export async function encodeContract(address) {
    const tmp = (await ergolib).Contract.pay_to_address((await ergolib).Address.from_base58(address));
    return tmp.ergo_tree().to_base16_bytes();
}

export async function getTxReduced(json, inputs, dataInputs, address) {
    console.log("getTxReduced", json, inputs, dataInputs);
    // build ergolib objects from json
    // Reduced transaction is encoded with Base64
    const unsignedTx = (await ergolib).UnsignedTransaction.from_json(JSONBigInt.stringify(json));
    const inputBoxes = (await ergolib).ErgoBoxes.from_boxes_json(inputs);
    const inputDataBoxes = (await ergolib).ErgoBoxes.from_boxes_json(dataInputs);
    const block_headers = (await ergolib).BlockHeaders.from_json(await getLastHeaders());
    const pre_header = (await ergolib).PreHeader.from_block_header(block_headers.get(0));
    const ctx = new (await ergolib).ErgoStateContext(pre_header, block_headers);
    const reducedTx = (await ergolib).ReducedTransaction.from_unsigned_tx(unsignedTx,inputBoxes,inputDataBoxes,ctx);
    const txReducedBase64 = byteArrayToBase64(reducedTx.sigma_serialize_bytes());

    var inputsB64 = inputs.map(function (chunk) {
        return  window.btoa(JSONBigInt.stringify(chunk));
    });
    // build Cold Signing Request as described in https://github.com/ergoplatform/eips/blob/34445e3e69c12f6e6dc2507c5f7bc3fc33ca4830/eip-0019.md
    const csrDict = {
        "reducedTx":txReducedBase64,
        "sender": address,
        "inputs": inputsB64
    };
    const csrDictStr = JSONBigInt.stringify(csrDict);
    var pageNumber = Math.round(csrDictStr.length/1000);
    if (csrDictStr.length%1000 !== 0) {pageNumber++};
    var csrResult = "CSR";
    if (pageNumber > 1) {
        csrResult += "/1/"+pageNumber;
    }
    csrResult += "-"+csrDictStr;

    // split by chunk of 1000 char to generates the QR codes
    return [txReducedBase64.match(/.{1,1000}/g), csrResult.match(/.{1,1000}/g)];
}

export async function getTxJsonFromTxReduced(txReduced){
    const reducedTx = (await ergolib).ReducedTransaction.sigma_parse_bytes(base64ToByteArray(txReduced));
    return  reducedTx.unsigned_tx().to_js_eip12();
}
