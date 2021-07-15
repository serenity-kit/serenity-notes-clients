import React from "react";
import { EditorView } from "prosemirror-view";
import { IconType } from "react-icons/lib";

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
  const canDoCommand = command(editorView.state);

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
        color: canDoCommand ? "black" : "#ccc",
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
