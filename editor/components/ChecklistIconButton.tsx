import React from "react";
import { EditorView } from "prosemirror-view";
import { wrapInList } from "../commands/lists";
import ChecklistIcon from "./ChecklistIcon";

type Props = {
  editorView: EditorView;
  nodeType: any;
  title: string;
};

export default function CheckListButton({
  editorView,
  nodeType,
  title,
}: Props) {
  const command = wrapInList(nodeType);
  const canWrap = command(editorView.state);

  return (
    <button
      title={title}
      onMouseDown={(evt) => {
        evt.preventDefault();
        command(editorView.state, editorView.dispatch);
      }}
      style={{
        border: "0 solid transparent",
        fontSize: 26,
        borderRadius: 8,
        background: "white",
        color: canWrap ? "black" : "#ccc",
        padding: "5px",
        marginRight: "2px",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <ChecklistIcon
        style={{
          display: "inline-block",
          verticalAlign: "middle",
        }}
      />
    </button>
  );
}
