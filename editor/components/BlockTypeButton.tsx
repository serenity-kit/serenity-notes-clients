import React from "react";
import { EditorView } from "prosemirror-view";
import { IconType } from "react-icons/lib";
import { NodeType } from "prosemirror-model";
import toggleBlockType from "../commands/toggleBlockType";
import CSS from "csstype";
import isNodeActive from "../utils/isNodeActive";
import { HeadingAttrs } from "../types";
import Button from "./Button";
import headingAttributesMatch from "../utils/headingAttributesMatch";

type Props = {
  editorView: EditorView;
  icon: IconType;
  title: string;
  attrs?: HeadingAttrs;
  nodeType: NodeType;
  children?: React.ReactNode;
  style?: CSS.Properties;
};

export default function BlockTypeButton({
  editorView,
  icon,
  title,
  nodeType,
  attrs,
  children,
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
    <Button
      isActive={isActive}
      canDoCommand={canDoCommand}
      title={title}
      onMouseDown={(evt) => {
        evt.preventDefault();
        command(editorView.state, editorView.dispatch);
      }}
      style={style}
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
    </Button>
  );
}
