import logo_telegram from "../resources/logo_telegram.svg";
import GitHub from "../resources/GitHub.png";
import dApps from "../resources/dApps.svg";


export default function Footer() {
    return (
        <footer class="align-items-center">
            <div class="col-md-12 text-muted ">
                © 2021 ThierryM1212&nbsp;-&nbsp;
                <a href="https://t.me/ThierryM1212" target="_blank">
                    <img src={logo_telegram} width="20" height="20" class="d-inline-block align-top" alt="" />
                </a>
                &nbsp;
                <a href="https://github.com/ThierryM1212/" target="_blank">
                    <img src={GitHub} width="20" height="20" class="d-inline-block align-top" alt="" />
                </a>
                &nbsp;
                <a href="https://dapp.ergo.ga/" target="_blank">
                    <img src={dApps} width="50" height="20" class="d-inline-block align-top" alt="" />
                </a>
            </div>
        </footer>
    )
}