import React from 'react';
import QRCode from 'qrcode.react';

export default class QR extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            key: props.key,
            size: 256,
        };
        this.zoomInOut = this.zoomInOut.bind(this);
    }

    zoomInOut() {
        if (this.state.size === 256) {
            this.setState({size: 512});
        } else {
            this.setState({size: 256});
        }
    }

    render() {

        return (
            <div className="m-1 p-1 ">
            {
               this.state.value !== '' ? 
               <QRCode value={this.state.value} 
               size={this.state.size} 
               includeMargin="true" onClick={this.zoomInOut}/> : null
            }
        </div>
        )
    }
}

