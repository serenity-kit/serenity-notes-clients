import React from "react";
import { EditorView } from "prosemirror-view";
import { EditorState } from "prosemirror-state";
import { IconType } from "react-icons/lib";
import { NodeType } from "prosemirror-model";
import { setBlockType } from "prosemirror-commands";

type Attrs = {
  level?: 2;
};

type Props = {
  editorView: EditorView;
  icon: IconType;
  title: string;
  attrs?: Attrs;
  nodeType: NodeType;
};

const isActive = ({
  state,
  nodeType,
  attrs,
}: {
  state: EditorState;
  attrs?: Attrs;
  nodeType: NodeType;
}) => {
  // @ts-ignore
  const { $from, to, node } = state.selection;
  if (node) return node.hasMarkup(nodeType, attrs);
  return (
    to <= $from.end() &&
    $from.parent.hasMarkup(nodeType) &&
    $from.parent.attrs.level === attrs?.level
  );
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
    !isActive({ state: editorView.state, nodeType, attrs }) &&
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
        fontSize: 24,
        borderRadius: 4,
        background: "white",
        color: canDoCommand ? "black" : "#ccc",
        padding: "0rem 0.3rem 0.2rem",
        marginRight: "0.1rem",
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
