import React from "react";

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  canDoCommand: boolean;
  isActive?: boolean;
  title?: string;
};

export default function Button({
  canDoCommand,
  isActive,
  style,
  ...otherProps
}: Props) {
  return (
    <button
      {...otherProps}
      style={{
        border: "0 solid transparent",
        background: isActive ? "black" : "white",
        color: isActive ? "white" : canDoCommand ? "black" : "#ccc",
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
