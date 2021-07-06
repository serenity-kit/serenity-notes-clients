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
  children?: React.ReactNode;
};

export default function BlockTypeButton({
  editorView,
  icon,
  title,
  nodeType,
  attrs,
  children,
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
        paddingRight: 0,
        paddingLeft: 10,
        paddingTop: 10,
        paddingBottom: 10,
        width: "100%",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
      }}
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
    </button>
  );
}
