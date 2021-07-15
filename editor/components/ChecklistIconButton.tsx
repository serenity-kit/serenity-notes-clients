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
        fontSize: 24,
        borderRadius: 8,
        background: "white",
        color: canWrap ? "black" : "#ccc",
        padding: "0rem 0.3rem 0.2rem",
        marginRight: "0.1rem",
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
