import { EditorState } from "prosemirror-state";
import { NodeType } from "prosemirror-model";
import { HeadingAttrs } from "../types";

export default ({
  state,
  nodeType,
  attrs,
}: {
  state: EditorState;
  attrs?: HeadingAttrs;
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
