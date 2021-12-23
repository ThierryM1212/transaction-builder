import React from "react";
import ReactTooltip from "react-tooltip";

export default function ImageButton(props) {
    return (
        <div>
            <span
                className={"material-icons " + props.color}
                onClick={props.onClick}
                data-tip
                data-for={props.id}
            >
                {props.icon}
            </span>
            <ReactTooltip id={props.id} place="top" effect="solid" html={true}>
                {props.tips}
            </ReactTooltip>
            &nbsp;
        </div>
    )

}