import React from "react";
import CSS from "csstype";

type Props = {
  style?: CSS.Properties;
};

export default function ChecklistIcon(props: Props) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      version="1.1"
      style={props.style}
    >
      <title>Checklist Icon</title>
      <path
        d="M5.27747564,15.9954951 L6.07297077,16.7909903 L2.89099026,19.9729708 L1.3,18.3819805 L2.09549513,17.5864854 L2.89099026,18.3819805 L5.27747564,15.9954951 Z M5.27747564,3.99549513 L6.07297077,4.79099026 L2.89099026,7.97297077 L1.3,6.38198052 L2.09549513,5.58648539 L2.89099026,6.38198052 L5.27747564,3.99549513 Z M5.27747564,9.99549513 L6.07297077,10.7909903 L2.89099026,13.9729708 L1.3,12.3819805 L2.09549513,11.5864854 L2.89099026,12.3819805 L5.27747564,9.99549513 Z M7,5 L7,7 L21,7 L21,5 L7,5 Z M7,19 L21,19 L21,17 L7,17 L7,19 Z M7,13 L21,13 L21,11 L7,11 L7,13 Z"
        fill="currentColor"
      ></path>
    </svg>
  );
}
