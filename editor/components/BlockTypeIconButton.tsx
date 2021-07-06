import React from "react";
import { EditorView } from "prosemirror-view";
import { IconType } from "react-icons/lib";
import { NodeType } from "prosemirror-model";
import { setBlockType } from "prosemirror-commands";
import isActiveNode from "../utils/isActiveNode";
import { HeadingAttrs } from "../types";

type Props = {
  editorView: EditorView;
  icon: IconType;
  title: string;
  attrs?: HeadingAttrs;
  nodeType: NodeType;
};

export default function BlockTypeButton({
  editorView,
  icon,
  title,
  nodeType,
  attrs,
}: Props) {
  const Icon = icon;
  const command = setBlockType(nodeType, attrs);
  const canDoCommand =
    !isActiveNode({ state: editorView.state, nodeType, attrs }) &&
    command(editorView.state);

  return (
    <button
      title={title}
      onMouseDown={(evt) => {
        evt.preventDefault();
        command(editorView.state, editorView.dispatch);
      }}
      style={{
        border: "0 solid transparent",
        borderRadius: 4,
        background: "white",
        color: canDoCommand ? "black" : "#ccc",
        padding: "0rem 0.3rem 0.2rem 0.3rem",
        marginRight: "0.1rem",
        fontSize: 24,
      }}
    >
      <Icon
        style={{
          fontSize: 24,
          display: "inline-block",
          verticalAlign: "middle",
        }}
      />
    </button>
  );
}
