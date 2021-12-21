import React, { Fragment } from 'react';
import InputString from './components/InputString';
import InputAddress from './components/InputAddress';
import UtxosSummary from './components/UtxosSummary';
import OutputBoxCreator from './components/OutputBoxCreator';
import OutputEditable from './components/OutputEditable';
import TransactionSummary from './components/TransactionSummary';
import ImageButton from './components/ImageButton';
import ImageButtonLabeled from './components/ImageButtonLabeled';
import QRCodes from './components/QRCodes';
import ReactJson from 'react-json-view';
import { UtxoItem } from './components/UtxoItem';
import { unspentBoxesFor, boxById } from './ergo-related/explorer';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { getAllUtxos, connectYoroi, getChangeAddress, yoroiSignTx } from './ergo-related/yoroi';
import { parseUtxo, parseUtxos, generateSwaggerTx, enrichUtxos, buildBalanceBox } from './ergo-related/utxos';
import { getTxReduced, getTxJsonFromTxReduced } from './ergo-related/serializer';
import JSONBigInt from 'json-bigint';
import { errorAlert, waitingAlert } from './utils/Alerts';

/* global BigInt */

const initCreateBox = {
    value: '0',
    ergoTree: '',
    assets: [],
    additionalRegisters: {},
    creationHeight: 600000,
    extension: {}
};

const feeBox = {
    value: "2000000",
    ergoTree: "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304",
    assets: [],
    additionalRegisters: {},
    creationHeight: 600000,
    extension: {}
}


export default class TxBuilder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address: props.address,
            setAddress: props.setAddress,
            addressBoxList: [],
            otherBoxList: [],
            outputList: [],
            selectedBoxList: [],
            selectedDataBoxList: [],
            searchBoxId: props.searchBoxId,
            setSearchBoxId: props.setSearchBoxId,
            searchAddress: props.searchAddress,
            setSearchAddress: props.setSearchAddress,
            outputCreateJson: initCreateBox,
            txJsonRaw: '',
            txReduced: [],
            CSR: [],
        };
        this.fetchUtxos = this.fetchUtxos.bind(this);
        this.fetchByBoxId = this.fetchByBoxId.bind(this);
        this.fetchByAddress = this.fetchByAddress.bind(this);
        this.selectInputBox = this.selectInputBox.bind(this);
        this.selectDataInputBox = this.selectDataInputBox.bind(this);
        this.unSelectInputBox = this.unSelectInputBox.bind(this);
        this.unSelectDataInputBox = this.unSelectDataInputBox.bind(this);
        this.fetchYoroi = this.fetchYoroi.bind(this);
        this.addOutputBox = this.addOutputBox.bind(this);
        this.resetCreateBoxJson = this.resetCreateBoxJson.bind(this);
        this.unSelectOutoutBox = this.unSelectOutoutBox.bind(this);
        this.moveOutputBoxDown = this.moveOutputBoxDown.bind(this);
        this.moveOutputBoxUp = this.moveOutputBoxUp.bind(this);
        this.moveInputBoxUp = this.moveInputBoxUp.bind(this);
        this.moveInputBoxDown = this.moveInputBoxDown.bind(this);
        this.setSearchAddress = this.setSearchAddress.bind(this);
        this.setTxJsonRaw = this.setTxJsonRaw.bind(this);
        this.getYoroiTx = this.getYoroiTx.bind(this);
        this.setTxYoroiJsonRaw = this.setTxYoroiJsonRaw.bind(this);
        this.setTxSwaggerJsonRaw = this.setTxSwaggerJsonRaw.bind(this);
        this.loadTxFromJsonRaw = this.loadTxFromJsonRaw.bind(this);
        this.setTxReduced = this.setTxReduced.bind(this);
        this.loadTxReduced = this.loadTxReduced.bind(this);
        this.resetTxReduced = this.resetTxReduced.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            address: nextProps.address,
            searchBoxId: nextProps.searchBoxId,
            searchAddress: nextProps.searchAddress,
        });
    }

    fetchUtxos() {
        unspentBoxesFor(this.state.address)
            .then(addressBoxList => {
                if (addressBoxList.status !== 404) {
                    const addressListFixed = parseUtxos(addressBoxList, true);
                    this.setState({
                        addressBoxList: addressListFixed
                    })
                }
            })
            .catch((error) => console.log(error));
    }

    fetchByAddress() {
        unspentBoxesFor(this.state.searchAddress)
            .then(otherBoxList => {
                if (otherBoxList.status !== 404) {
                    const otherBoxListFixed = parseUtxos(otherBoxList, true);
                    for (const box of otherBoxListFixed) {
                        this.setState(prevState => ({
                            otherBoxList: [...prevState.otherBoxList, box]
                        }))
                    }
                }
            })
            .catch((error) => console.log(error));
    }

    fetchByBoxId() {
        boxById(this.state.searchBoxId)
            .then(box => {
                if (box.status !== 404) {
                    const boxFixed = parseUtxo(box, true);
                    this.setState(prevState => ({
                        otherBoxList: [...prevState.otherBoxList, boxFixed]
                    }))
                }
            })
    }

    setSearchAddress(address) {
        this.setState({ address: address });
    }

    fetchYoroi() {
        var alert = waitingAlert("Connecting to Yoroi...");
        connectYoroi().then(access_granted => {
            if (access_granted) {
                alert.update({ title: "Get Yoroi wallet content..." })
                getAllUtxos().then(utxos => {
                    console.log("utxos", utxos)
                    this.setState({
                        addressBoxList: parseUtxos(utxos)
                    })
                }).then(
                    getChangeAddress().then(yoroiAddress => {
                        this.setSearchAddress(yoroiAddress);
                        alert.close();
                    })
                )
            } else {
                console.log("Yoroi access failed");
                errorAlert("Yoroi access failed");
            }
        })
    }

    selectInputBox(box) {
        if (!Array.isArray(box)) {
            var boxFound = false;
            for (const i in this.state.selectedBoxList) {
                if (this.state.selectedBoxList[i].boxId === box.boxId) {
                    boxFound = true;
                }
            }
            if (!boxFound) {
                this.setState(prevState => ({
                    selectedBoxList: [...prevState.selectedBoxList, box]
                }))
            }
        }
    }

    selectDataInputBox(box) {
        if (!Array.isArray(box)) {
            var boxFound = false;
            for (const i in this.state.selectedDataBoxList) {
                if (this.state.selectedDataBoxList[i].boxId === box.boxId) {
                    boxFound = true;
                }
            }
            if (!boxFound) {
                this.setState(prevState => ({
                    selectedDataBoxList: [...prevState.selectedDataBoxList, box]
                }))
            }
        }
    }

    unSelectInputBox(box) {
        if (!Array.isArray(box)) {
            this.setState(prevState => ({
                selectedBoxList: prevState.selectedBoxList.filter(boxinlist => boxinlist.boxId !== box.boxId)
            }));
        }
    }

    unSelectDataInputBox(box) {
        if (!Array.isArray(box)) {
            this.setState(prevState => ({
                selectedDataBoxList: prevState.selectedDataBoxList.filter(boxinlist => boxinlist.boxId !== box.boxId)
            }));
        }
    }

    unSelectOutoutBox(id) {
        console.log("unSelectOutoutBox", id, this.state.outputList);
        let outputListNew = [...this.state.outputList];
        outputListNew.splice(id, 1);
        this.setState({ outputList: outputListNew });
    }

    addOutputBox() {
        this.setState(prevState => ({
            outputList: [...prevState.outputList, prevState.outputCreateJson]
        }))
        this.resetCreateBoxJson();
    }

    setCreateBoxJson = (key, json) => {
        this.setState({ outputCreateJson: json });
    }

    setOutputItem = (key, json) => {
        console.log("setOutputItem", key, json);
        let outputListNew = [...this.state.outputList];
        outputListNew[key] = json;
        this.setState({ outputList: outputListNew });
    }

    resetCreateBoxJson = () => {
        this.setState({ outputCreateJson: initCreateBox });
    }

    setFeeBoxJson = () => {
        this.setState({ outputCreateJson: feeBox });
    }

    setBalanceBoxBoxJson = () => {
        buildBalanceBox(this.state.selectedBoxList, this.state.outputList, this.state.address).then(balanceBox => {
            console.log("balanceBox", balanceBox);
            if (BigInt(balanceBox.value) < 100000) {
                errorAlert("Not enough ERG in inputs");
            } else {
                this.setState({ outputCreateJson: balanceBox });
            }
        })
    }

    moveOutputBoxUp(id) {
        console.log("moveOutputBoxUp", id);
        if (id > 0) {
            let outputListNew = [...this.state.outputList];
            outputListNew[id] = this.state.outputList[id - 1]
            outputListNew[id - 1] = this.state.outputList[id]
            this.setState({ outputList: outputListNew });
        }
    }

    moveOutputBoxDown(id) {
        console.log("moveOutputBoxDown", id);
        if (id < this.state.outputList.length - 1) {
            let outputListNew = [...this.state.outputList];
            outputListNew[id] = this.state.outputList[id + 1]
            outputListNew[id + 1] = this.state.outputList[id]
            this.setState({ outputList: outputListNew });
        }
    }

    moveInputBoxUp(id) {
        console.log("moveInputBoxUp", id);
        if (id > 0) {
            let selectedBoxListNew = [...this.state.selectedBoxList];
            selectedBoxListNew[id] = this.state.selectedBoxList[id - 1]
            selectedBoxListNew[id - 1] = this.state.selectedBoxList[id]
            this.setState({ selectedBoxList: selectedBoxListNew });
        }
    }

    moveInputBoxDown(id) {
        console.log("moveInputBoxUp", id);
        if (id < this.state.selectedBoxList.length - 1) {
            let selectedBoxListNew = [...this.state.selectedBoxList];
            selectedBoxListNew[id] = this.state.selectedBoxList[id + 1]
            selectedBoxListNew[id + 1] = this.state.selectedBoxList[id]
            this.setState({ selectedBoxList: selectedBoxListNew });
        }
    }

    async sendTxYoroi(tx) {
        const yoroiConnected = await connectYoroi();
        console.log("sendTxYoroi", yoroiConnected);
        if (yoroiConnected) {
            const txSent = yoroiSignTx(tx)
            console.log("txSent", txSent)
        } else {
            console.log("Not connected to Yoroi")
        }
    }

    getYoroiTx() {
        return {
            inputs: this.state.selectedBoxList,
            outputs: this.state.outputList,
            dataInputs: this.state.selectedDataBoxList,
        };
    }

    setTxJsonRaw(textAreaInput) {
        console.log("setTxJsonRaw", textAreaInput);
        var jsonFixed = {};
        if (typeof textAreaInput === 'string'  ) {
            if (textAreaInput.startsWith("{")) {
                jsonFixed = JSONBigInt.stringify(JSONBigInt.parse(textAreaInput));
            } else {
                this.setState({ txJsonRaw: textAreaInput});
                return;
            }
        } else {
            jsonFixed = JSONBigInt.stringify(textAreaInput, null, 2);
        }
        this.setState({ txJsonRaw: jsonFixed});
    }

    setTxYoroiJsonRaw() {
        this.setTxJsonRaw(this.getYoroiTx());
    }
    setTxSwaggerJsonRaw() {
        this.setTxJsonRaw(generateSwaggerTx(this.getYoroiTx()));
    }
    setTxReduced() {
        getTxReduced(this.getYoroiTx(), this.state.selectedBoxList, this.state.selectedDataBoxList, this.state.address).then(res => {
            this.setState({
                txReduced: res[0],
                CSR: res[1],
            });
        })
    }
    resetTxReduced() {
        this.setState({
            txReduced: [],
            CSR: [],
        });
    }

    async loadTxReduced() {
        console.log("loadTxReduced", this.state.txJsonRaw);
        getTxJsonFromTxReduced(this.state.txJsonRaw).then(json => {
            this.loadTxFromJson(json);
        })
    }

    async loadTxFromJsonRaw() {
        const json = JSONBigInt.parse(this.state.txJsonRaw);
        await this.loadTxFromJson(json);
    }

    async loadTxFromJson(json) {
        var inputs = [];
        var dataInputs = [];
        var outputs = [];
        try {
            if ("tx" in json) {
                inputs = await enrichUtxos(json.tx.inputs);
                dataInputs = await enrichUtxos(json.tx.dataInputs);
                outputs = parseUtxos(json.tx.outputs, true, 'output');
            } else {
                inputs = await enrichUtxos(json.inputs);
                dataInputs = await enrichUtxos(json.dataInputs);
                outputs = parseUtxos(json.outputs, true, 'output');
            }

            this.setState({
                selectedBoxList: inputs,
                selectedDataBoxList: dataInputs,
                outputList: outputs,
            });
        } catch (e) {
            console.log(e);
            errorAlert("Failed to parse transaction json", e)
        }
    }

    render() {
        const txJson = this.getYoroiTx();
        var swaggertips = "This transaction can be signed using your node wallet and swagger UI:<br />";
        swaggertips += "- Unlock the wallet using: $SWAGGER/wallet/unlock/<br />";
        swaggertips += "- Sign the transaction copying the Swagger json to $SWAGGER/wallet/transaction/sign<br />";
        swaggertips += "- Send the transaction copying the signed json to $SWAGGER/transactions";
        swaggertips += "This should be used after having add the fee box.";


        return (

            <Fragment >
                <div className="w-100 container">
                    <h4>Transaction builder</h4>
                    <div className="w-100 container-xxl ">
                        <div className="card p-1 m-2 w-100">
                            <InputAddress label="ERG address"
                                value={this.state.address}
                                onChange={this.state.setAddress}
                                onClick={this.fetchUtxos}
                                fetchYoroi={this.fetchYoroi}
                            />
                            <div className="d-flex flex-wrap">
                                {this.state.addressBoxList.map(item => (
                                    <div key={item.boxId} className="card m-2" >
                                        <UtxoItem
                                            boxId={item.boxId}
                                            json={item}
                                            action={this.selectInputBox}
                                            action2={this.selectDataInputBox}
                                            icon="add_box"
                                            tips="Add to selected inputs"
                                            color="green"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="container-xxl w-100">
                        <div className="card p-1 m-2 w-100">
                            <h6>Additional boxes</h6>
                            <InputString label="Search by boxId"
                                value={this.state.searchBoxId}
                                onChange={this.state.setSearchBoxId}
                                onClick={this.fetchByBoxId}
                            />
                            <InputString label="Search by script address"
                                value={this.state.searchAddress}
                                onChange={this.state.setSearchAddress}
                                onClick={this.fetchByAddress}
                            />
                            <div className="d-flex flex-wrap">
                                {this.state.otherBoxList.map(item => (
                                    <div key={item.boxId} className="card m-2" >
                                        <UtxoItem
                                            boxId={item.boxId}
                                            json={item}
                                            action={this.selectInputBox}
                                            action2={this.selectDataInputBox}
                                            icon="add_box"
                                            tips="Add to selected inputs"
                                            color="green"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="w-100 container-xxl ">
                        <div className="card p-1 m-2 w-100">
                            <h6>Selected data input boxes</h6>
                            <div className="d-flex flex-wrap">
                                {this.state.selectedDataBoxList.map(item => (
                                    <div key={item.boxId} className="card m-2 " >
                                        <UtxoItem
                                            boxId={item.boxId}
                                            json={item}
                                            action={this.unSelectDataInputBox}
                                            icon="clear"
                                            tips="Remove from selected data inputs"
                                            color="red"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="w-100 container-xxl ">
                        <div className="card p-1 m-2 w-100">
                            <h6 keu="selected-input-title">Selected input boxes</h6>
                            <div className="d-flex flex-wrap">
                                {this.state.selectedBoxList.map((item, index) => (
                                    <div key={index} className="card m-2 " >
                                        <UtxoItem
                                            boxId={item.boxId}
                                            json={item}
                                            action={this.unSelectInputBox}
                                            icon="clear"
                                            tips="Remove from selected inputs"
                                            id={index}
                                            moveUp={this.moveInputBoxUp}
                                            moveDown={this.moveInputBoxDown}
                                            color="red"
                                        />
                                    </div>
                                ))}
                            </div>
                            <UtxosSummary list={this.state.selectedBoxList} name="inputs" label="Selected inputs list" />
                        </div>
                    </div>

                    <div className="w-100 container-xxl ">
                        <div className="card p-1 m-2 w-100">
                            <h6>Output boxes editor</h6>

                            <OutputBoxCreator
                                json={this.state.outputCreateJson}
                                onChange={this.setCreateBoxJson}
                                reset={this.resetCreateBoxJson}
                                add={this.addOutputBox}
                                fee={this.setFeeBoxJson}
                                balance={this.setBalanceBoxBoxJson}
                            />
                        </div>
                    </div>

                    <div className="w-100 container-xxl ">
                        <div className="card p-1 m-2 w-100">
                            <h6>Selected output boxes</h6>
                            <div className="d-flex flex-wrap">
                                {this.state.outputList.map((item, index, arr) => (
                                    <OutputEditable
                                        json={item}
                                        onEdit={this.setOutputItem}
                                        key={index}
                                        id={index}
                                        delete={this.unSelectOutoutBox}
                                        moveUp={this.moveOutputBoxUp}
                                        moveDown={this.moveOutputBoxDown}
                                    />
                                ))}
                            </div>
                            <UtxosSummary list={this.state.outputList} name="outputs" label="Outputs list" />
                        </div>
                    </div>

                    <div className="w-100 container-xxl ">
                        <div className="card p-1 m-2 w-100">
                            <TransactionSummary json={txJson} />
                            <div className="d-flex flex-row">
                                <h6>Transaction Yoroi</h6>
                                &nbsp;
                                <ImageButton id="send-yoroi" color="blue" icon="send" tips="Send transaction to Yoroi"
                                    onClick={() => { this.sendTxYoroi(txJson); }} />
                            </div>
                            <ReactJson
                                src={txJson}
                                theme="monokai"
                                collapsed={true}
                                name="tx"
                                collapseStringsAfterLength={60}
                            />

                            <div className="d-flex flex-row">
                                <h6>Transaction Swagger</h6>&nbsp;
                                <ImageButton id="help-swagger" icon="help_outline"
                                    tips={swaggertips} />
                            </div>
                            <ReactJson
                                src={generateSwaggerTx(txJson)}
                                theme="monokai"
                                collapsed={true}
                                name={false}
                                collapseStringsAfterLength={60}
                            />

                            <div className="d-flex flex-column">
                                <div className="d-flex flex-row">
                                    <h6>Transaction reduced</h6> &nbsp;
                                    <ImageButton id="get-reduced-tx" color="red" icon="restart_alt" tips="Reset reduced transaction"
                                        onClick={this.resetTxReduced} />
                                    <ImageButton id="get-reduced-tx" color="blue" icon="calculate" tips="Get reduced transaction and <br/> ColdSignigRequest"
                                        onClick={this.setTxReduced} />
                                </div>
                                <textarea id='reducedTxTextArea' defaultValue={this.state.txReduced.join('') } readOnly = {true}/>
                                <QRCodes list={this.state.txReduced} />
                                <h6>Cold Signing Request (EIP-19)</h6>
                                <textarea id='ColdSignigRequest' defaultValue={this.state.CSR.join('') } readOnly = {true}/>
                                <QRCodes list={this.state.CSR} />
                            </div>


                        </div>
                    </div>

                    <div className="w-100 container-xxl ">
                        <div className="card p-1 m-2 w-100">

                            <h6>Transaction import/export</h6>
                            <div className="d-flex flex-row p-1">
                                <ImageButtonLabeled  id="get-yoroi-tx" color="blue" icon="download"
                                    label="Get Yoroi format" onClick={this.setTxYoroiJsonRaw}
                                />
                                <ImageButtonLabeled id="get-swagger-tx" color="blue" icon="download"
                                    label="Get Swagger format" onClick={this.setTxSwaggerJsonRaw}
                                />
                                <ImageButtonLabeled id="load-tx" color="blue" icon="upload"
                                    label="Load transaction json" onClick={this.loadTxFromJsonRaw}
                                />
                                <ImageButtonLabeled id="load-tx" color="blue" icon="upload"
                                    label="Load transaction reduced" onClick={this.loadTxReduced}
                                />
                            </div>
                            <CodeEditor
                                value={this.state.txJsonRaw}
                                language="json"
                                placeholder="json or reduced transaction"
                                onChange={(evn) => this.setTxJsonRaw(evn.target.value)}
                                padding={10}
                                style={{
                                    fontSize: 12,
                                    backgroundColor: "#f5f5f5",
                                    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                                }}
                            />
                         </div>
                    </div>
                </div>
                <br />
            </Fragment>
        )
    }
}

