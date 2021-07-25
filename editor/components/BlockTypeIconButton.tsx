import React from "react";
import { EditorView } from "prosemirror-view";
import { IconType } from "react-icons/lib";
import { NodeType } from "prosemirror-model";
import toggleBlockType from "../commands/toggleBlockType";
import CSS from "csstype";
import isNodeActive from "../utils/isNodeActive";
import { HeadingAttrs } from "../types";
import headingAttributesMatch from "../utils/headingAttributesMatch";

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
  const command = toggleBlockType(nodeType, attrs);
  const canDoCommand = command(editorView.state);
  const isActive = isNodeActive(
    editorView.state,
    nodeType,
    attrs,
    headingAttributesMatch
  );

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
        background: isActive ? "black" : "white",
        color: isActive ? "white" : canDoCommand ? "black" : "#ccc",
        fontSize: 26,
        position: "relative",
        padding: "5px",
        marginRight: "2px",
        display: "inline-flex",
        alignItems: "center",
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
