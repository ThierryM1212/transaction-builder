
import QR from "./QRCode";

export default function QRCodes(props) {
    return (
        <div className="d-flex flex-wrap">
            {props.list.map((item, index) => (
                <div key={index} className="m-2" >
                    <QR value={item}  key={index}/>
                </div>
            ))}
        </div>
    )
}
