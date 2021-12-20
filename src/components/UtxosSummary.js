import { getUtxosListValue, getTokenListFromUtxos } from '../ergo-related/utxos';

export default function UtxosSummary(props) {
    return (
        <div className="card m-1 p-1" >
            <div className="d-flex flex-row">
            <h6>Total selected:&nbsp; {parseFloat(parseInt(getUtxosListValue(props.list)) / 1000000000).toFixed(4)} ERG</h6>
            </div>
            { getTokenListFromUtxos(props.list) === {} ? 
            <table border="1" >
                <thead>
                    <tr><td><h6>Tokens</h6></td>
                        <td><h6>Amount</h6></td></tr>
                </thead>
                
                <tbody>
                    {
                        Object.entries(getTokenListFromUtxos(props.list)).map(([key, value]) => (
                            <tr key={key}><td>{key}</td><td>{value}</td></tr>
                        ))
                    }
                </tbody>

            </table>
            : <h6>No token selected</h6>
            }
            
        </div>
    )
}

