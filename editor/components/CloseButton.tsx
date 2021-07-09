import React from "react";
import CSS from "csstype";
import { MdClose } from "react-icons/md";
import * as theme from "../theme";

type Props = {
  style?: CSS.Properties;
  onPointerDown: React.PointerEventHandler<HTMLButtonElement>;
};

export default function CloseButton(props: Props) {
  return (
    <button
      onPointerDown={props.onPointerDown}
      type="button"
      style={{
        background: theme.colors.white,
        color: theme.colors.text,
        padding: 5,
        display: "flex",
        alignItems: "center",
        borderRadius: "100%",
        border: `0.5px solid ${theme.colors.divider}`,
        ...props.style,
      }}
    >
      <MdClose
        style={{
          fontSize: 16,
        }}
      />
    </button>
  );
}
