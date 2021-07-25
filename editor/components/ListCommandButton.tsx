import React from "react";
import { EditorView } from "prosemirror-view";
import { IconType } from "react-icons/lib";
import { schema } from "../schema";

type Props = {
  editorView: EditorView;
  icon: IconType;
  title: string;
  command: any;
};

export default function CommandButton({
  editorView,
  icon,
  title,
  command,
}: Props) {
  const Icon = icon;
  const listCommand = command(schema.nodes.list_item);
  const checklistCommand = command(schema.nodes.checklist_item);
  const canDoListCommand = listCommand(editorView.state);
  const canDoChecklistCommand = checklistCommand(editorView.state);

  return (
    <button
      title={title}
      onMouseDown={(evt) => {
        evt.preventDefault();
        if (canDoListCommand) {
          listCommand(editorView.state, editorView.dispatch);
        } else if (canDoChecklistCommand) {
          checklistCommand(editorView.state, editorView.dispatch);
        }
      }}
      style={{
        border: "0 solid transparent",
        fontSize: 26,
        borderRadius: 8,
        background: "white",
        color: canDoListCommand || canDoChecklistCommand ? "black" : "#ccc",
        padding: "5px",
        marginRight: "2px",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <Icon
        style={{
          display: "inline-block",
          verticalAlign: "middle",
        }}
      />
    </button>
  );
}
