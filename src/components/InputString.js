import ImageButton from "./ImageButton"



export default function InputString(props) {
    return (
        <div className="flew-row d-flex align-items-center p-1">
            
            <label className="col-sm-3" htmlFor="ref" >{props.label}:&nbsp;</label>
            <div className="col-sm">
            <input className="form-control grey-input"
                id="ref"
                pattern="[a-zA-Z0-9]*"
                onChange={e => props.onChange(e.target.value)}
                value={props.value} />
                </div>
            &nbsp;
            { props.onClick ?
                <ImageButton color="blue" icon="download" tips="Fetch explorer" onClick={e => props.onClick()}/>
                : null
            }
        </div>
    )
}
