import { buildTokenList, getMissingErg, getMissingTokens, isDict } from "../utils/utils";
import { closeAlert, waitingAlert, errorAlert, displayTransaction } from '../utils/Alerts';
import JSONBigInt from 'json-bigint';
import { boxById, currentHeight } from "./explorer";
import { encodeContract } from "./serializer";

/* global ergo BigInt */


export async function isYoroiConnected() {
    console.log('isYoroiConnected');
    try {
        return await window.ergo_check_read_access();
    } catch (e) {
        console.error(e);
        return false;
    }
}

// Connect to Yoroi, return True is success
export async function connectYoroi() {
    
    const alreadyConnected = await isYoroiConnected();
    console.log('connectYoroi', alreadyConnected);
    if (!alreadyConnected) {
        return await window.ergo_request_read_access().then(access_granted => {
            return access_granted;
        });
    } else return alreadyConnected;
}

export async function getChangeAddress() {
    const yoroiConnected = await connectYoroi();
    if (yoroiConnected) {
        const address = await ergo.get_change_address();
        return address;
    } else {
        return null;
    }
}

export async function yoroiSignTx(tx) {
    
    const alert = waitingAlert("Connecting to Yoroi...");
    const yoroiAccessGranted = await connectYoroi();
    console.log('yoroiSignTx', yoroiAccessGranted);
    if (yoroiAccessGranted) {
        alert.update({ title: "Waiting for transaction signing..." });
        processTx(tx).then(txId => {
            closeAlert(alert);
            if (txId) {
                console.log('[txId]', txId);
                displayTransaction(txId);
            } else {
                const title = "Transaction not signed";
                const message = "Something went wrong, the transaction was not sent.";
                errorAlert(title, message);
            }
        })
    } else {
        closeAlert(alert);
        console.log('Yoroi access denied');
    }
}

async function signTx(txToBeSigned) {
    try {
        console.log("signTx", txToBeSigned);
        return await ergo.sign_tx(txToBeSigned);
    } catch (e) {

        console.log(e);
        return null;
    }
}

async function submitTx(txToBeSubmitted) {
    try {
        console.log("submitTx");
        return await ergo.submit_tx(txToBeSubmitted);
    } catch (e) {
        console.log(e);
        return null;
    }
}

export async function processTx(txToBeProcessed) {
    const msg = s => {
        console.log('[processTx]', s);
    };
    const signedTx = await signTx(txToBeProcessed);
    if (!signedTx) {
        console.error(`No signed transaction found`);
        return null;
    }
    msg("Transaction signed - awaiting submission");
    const txId = await submitTx(signedTx);
    if (!txId) {
        console.log(`No submitted tx ID`);
        return null;
    }
    msg("Transaction submitted ");
    return txId;
}

export async function getAllUtxos() {
    const wasm = await import("ergo-lib-wasm-browser").catch(console.error);
    const filteredUtxos = [];
    return await ergo.get_utxos();
}

