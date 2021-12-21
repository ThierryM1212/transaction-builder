import Swal from 'sweetalert2/src/sweetalert2.js';
import '@sweetalert2/theme-dark/dark.css';
import withReactContent from 'sweetalert2-react-content';
import Spinner from '../resources/Spin-1.5s-94px.svg';

export function waitingAlert(title) {
    const MySwal = withReactContent(Swal)
    MySwal.fire({
        title: <p>{title}</p>,
        imageUrl: Spinner,
        allowOutsideClick: true,
        showConfirmButton: false,
    });
    return MySwal;
}

export function closeAlert(alert) {
    alert.close();
}

export function errorAlert(title, msg) {
    const MySwal = withReactContent(Swal)
    MySwal.fire({
        title: <p>{title}</p>,
        icon: 'error',
        text: msg,
        allowOutsideClick: false,
    });
    return MySwal;
}

export function displayTransaction(txId) {
    const MySwal = withReactContent(Swal)
    MySwal.fire({
        title: <p>Transaction sent succesfully</p>,
        allowOutsideClick: false,
        icon: 'success',
        html: `<p>The transaction will be visible in your wallet and in the explorer in few seconds: <a href="https://explorer.ergoplatform.com/en/transactions/${txId} target="_blank" > ${txId} </a></p>`,
    });
    return MySwal;
}
