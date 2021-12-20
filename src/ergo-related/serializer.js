import {Serializer} from "@coinbarn/ergo-ts";

let ergolib = import('ergo-lib-wasm-browser')

export async function encodeNum(n, isInt = false) {
    if (isInt) return (await ergolib).Constant.from_i32(n).encode_to_base16()
    else return (await ergolib).Constant.from_i64((await ergolib).I64.from_str(n)).encode_to_base16()
}

export async function decodeNum(n, isInt = false) {
    if (isInt) return (await ergolib).Constant.decode_from_base16(n).to_i32()
    else return (await ergolib).Constant.decode_from_base16(n).to_i64().to_str()

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
