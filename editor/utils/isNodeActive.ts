// https://github.com/ueberdosis/tiptap/blob/6212cb46d12e1765bebc3b7ccd5edecf84cb56b1/packages/core/src/helpers/isNodeActive.ts

import { EditorState } from "prosemirror-state";
import { NodeType } from "prosemirror-model";
import objectIncludes from "./objectIncludes";
import { NodeRange } from "../types";

export default function isNodeActive(
  state: EditorState,
  type: NodeType,
  attributes: Record<string, any> = {},
  attributesMatch: (object1: any, object2: any) => boolean = objectIncludes
): boolean {
  const { from, to, empty } = state.selection;

  let nodeRanges: NodeRange[] = [];

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isText) {
      const relativeFrom = Math.max(from, pos);
      const relativeTo = Math.min(to, pos + node.nodeSize);

      nodeRanges = [
        ...nodeRanges,
        {
          node,
          from: relativeFrom,
          to: relativeTo,
        },
      ];
    }
  });

  if (empty) {
    return !!nodeRanges
      .filter((nodeRange) => {
        if (!type) {
          return true;
        }

        return type.name === nodeRange.node.type.name;
      })
      .find((nodeRange) => attributesMatch(nodeRange.node.attrs, attributes));
  }

  const selectionRange = to - from;

  const range = nodeRanges
    .filter((nodeRange) => {
      if (!type) {
        return true;
      }

      return type.name === nodeRange.node.type.name;
    })
    .filter((nodeRange) => attributesMatch(nodeRange.node.attrs, attributes))
    .reduce((sum, nodeRange) => {
      const size = nodeRange.to - nodeRange.from;
      return sum + size;
    }, 0);

  return range >= selectionRange;
}
