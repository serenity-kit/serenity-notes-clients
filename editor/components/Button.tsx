import React from "react";
import CSS from "csstype";

type Props = {
  canDoCommand: boolean;
  title?: string;
  onMouseDown: React.MouseEventHandler<HTMLButtonElement>;
  style?: CSS.Properties;
  children?: React.ReactNode;
};

export default function Button({ canDoCommand, style, ...otherProps }: Props) {
  return (
    <button
      {...otherProps}
      style={{
        border: "0 solid transparent",
        background: "white",
        color: canDoCommand ? "black" : "#ccc",
        paddingRight: 0,
        paddingLeft: 10,
        paddingTop: 10,
        paddingBottom: 10,
        width: "100%",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        ...style,
      }}
    ></button>
  );
}
