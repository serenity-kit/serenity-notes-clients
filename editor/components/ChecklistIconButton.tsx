import React from "react";
import { EditorView } from "prosemirror-view";
import { toggleList } from "../commands/toggleList";
import ChecklistIcon from "./ChecklistIcon";
import isNodeActive from "../utils/isNodeActive";

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
  const command = toggleList(nodeType);
  const canWrap = command(editorView.state);
  const isActive = isNodeActive(editorView.state, nodeType);

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
        background: isActive ? "black" : "white",
        color: isActive ? "white" : canWrap ? "black" : "#ccc",
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
