import React from "react";
import * as theme from "../theme";

export default function HorizontalRule() {
  return (
    <hr
      style={{
        border: 0,
        borderBottom: `0.5px solid ${theme.colors.divider}`,
        width: "100%",
        height: 0,
        padding: 0,
        margin: 0,
      }}
    />
  );
}
