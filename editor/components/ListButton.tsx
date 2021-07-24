import React from "react";
import { EditorView } from "prosemirror-view";
import { toggleList } from "../commands/toggleList";
import { IconType } from "react-icons/lib";
import Button from "./Button";
import CSS from "csstype";

type Props = {
  editorView: EditorView;
  nodeType: any;
  icon: IconType;
  children?: React.ReactNode;
  title: string;
  style?: CSS.Properties;
};

export default function ListButton({
  editorView,
  icon,
  nodeType,
  title,
  style,
  children,
}: Props) {
  const command = toggleList(nodeType);
  const canWrap = command(editorView.state);
  const Icon = icon;

  return (
    <Button
      title={title}
      onMouseDown={(evt) => {
        evt.preventDefault();
        command(editorView.state, editorView.dispatch);
      }}
      canDoCommand={canWrap}
      style={style}
    >
      <Icon
        style={{
          fontSize: 24,
          display: "inline-block",
          verticalAlign: "middle",
          marginRight: 10,
        }}
      />
      {children}
    </Button>
  );
}
