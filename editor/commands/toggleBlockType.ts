import { NodeType } from "prosemirror-model";
import clearNodes from "../utils/clearNodes";
import isNodeActive from "../utils/isNodeActive";
import { EditorState, Transaction } from "prosemirror-state";
import { schema } from "../schema";
import { setBlockType } from "prosemirror-commands";
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
      return setBlockType(schema.nodes.paragraph)(state, dispatch);
    }

    return setBlockType(nodeType, attributes)(state, dispatch);
  };
}
