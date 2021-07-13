import React from "react";
import { EditorView } from "prosemirror-view";
import { IconType } from "react-icons/lib";
import { NodeType } from "prosemirror-model";
import { setBlockType } from "prosemirror-commands";
import CSS from "csstype";
import isActiveNode from "../utils/isActiveNode";
import { HeadingAttrs } from "../types";
import Button from "./Button";

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
  const command = setBlockType(nodeType, attrs);
  const canDoCommand =
    !isActiveNode({ state: editorView.state, nodeType, attrs }) &&
    command(editorView.state);

  return (
    <Button
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
