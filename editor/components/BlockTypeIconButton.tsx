import React from "react";
import { EditorView } from "prosemirror-view";
import { IconType } from "react-icons/lib";
import { NodeType } from "prosemirror-model";
import { setBlockType } from "prosemirror-commands";
import CSS from "csstype";
import isActiveNode from "../utils/isActiveNode";
import { HeadingAttrs } from "../types";

type Props = {
  editorView: EditorView;
  icon: IconType;
  title: string;
  attrs?: HeadingAttrs;
  nodeType: NodeType;
  headingLevelTwo?: boolean;
  style?: CSS.Properties;
};

export default function BlockTypeButton({
  editorView,
  icon,
  title,
  nodeType,
  attrs,
  headingLevelTwo,
  style,
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
        borderRadius: 8,
        background: "white",
        color: canDoCommand ? "black" : "#ccc",
        padding: "0rem 0.3rem 0.2rem 0.3rem",
        marginRight: "0.1rem",
        fontSize: 24,
        position: "relative",
        ...style,
      }}
    >
      <Icon
        style={{
          fontSize: 24,
          display: "inline-block",
          verticalAlign: "middle",
        }}
      />
      {headingLevelTwo ? (
        <span
          style={{
            position: "absolute",
            fontSize: "14px",
            left: 23,
            top: 11,
          }}
        >
          2
        </span>
      ) : null}
    </button>
  );
}
