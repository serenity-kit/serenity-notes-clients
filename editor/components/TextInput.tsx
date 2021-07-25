import React from "react";
import * as theme from "../theme";

type Props = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  disabled?: boolean;
};

const TextInput = (props: Props, ref: any) => {
  return (
    <input
      ref={ref}
      className="serenity-text-input"
      style={{
        WebkitAppearance: "none",
        appearance: "none",
        fontSize: 16,
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 14,
        paddingBottom: 14,
        backgroundColor: theme.colors.white,
        lineHeight: "22px",
        borderRadius: 6,
        border: `0.5px solid ${theme.colors.divider}`,
        color: props.disabled ? theme.colors.textBrightest : theme.colors.text,
        width: "100%",
        boxShadow: "none",
      }}
      {...props}
    />
  );
};

export default React.forwardRef(TextInput);
