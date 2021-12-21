
export function isDict(v) {
    return typeof v === 'object' && v !== null && !(v instanceof Array) && !(v instanceof Date);
}

export function formatLongString(str, num) {
    if (str.length > 2 * num) {
        return str.substring(0, num) + "..." + str.substring(str.length - num, str.length);
    } else {
        return str;
    }
}
