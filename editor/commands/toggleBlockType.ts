import { NodeType } from "prosemirror-model";
import clearNodes from "../utils/clearNodes";
import isNodeActive from "../utils/isNodeActive";
import { EditorState, Transaction } from "prosemirror-state";
import { schema } from "../schema";
import { setBlockType } from "./setBlockType";
import headingAttributesMatch from "../utils/headingAttributesMatch";

export default function toggleBlockType(
  nodeType: NodeType,
  attributes: Record<string, any> = {}
) {
  return (
    state: EditorState,
    dispatch?: (tr: Transaction) => boolean | void
  ) => {
    if (isNodeActive(state, nodeType, attributes, headingAttributesMatch)) {
      return setBlockType(schema.nodes.paragraph)(state.tr, dispatch);
    }

    const canSetBlockType = setBlockType(nodeType, attributes)(state.tr);
    if (!canSetBlockType) {
      const tr = clearNodes(state.tr);
      return setBlockType(nodeType, attributes)(tr, dispatch);
    }

    return setBlockType(nodeType, attributes)(state.tr, dispatch);
  };
}
