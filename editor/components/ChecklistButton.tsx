import React from "react";
import { EditorView } from "prosemirror-view";
import { toggleList } from "../commands/toggleList";
import Button from "./Button";
import CSS from "csstype";
import ChecklistIcon from "./ChecklistIcon";

type Props = {
  editorView: EditorView;
  nodeType: any;
  children?: React.ReactNode;
  title: string;
  style?: CSS.Properties;
};

export default function ChecklistButton({
  editorView,
  nodeType,
  title,
  style,
  children,
}: Props) {
  const command = toggleList(nodeType);
  const canWrap = command(editorView.state);

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
      <ChecklistIcon
        style={{
          fontSize: "24px",
          display: "inline-block",
          verticalAlign: "middle",
          marginRight: "10px",
        }}
      />
      {children}
    </Button>
  );
}
