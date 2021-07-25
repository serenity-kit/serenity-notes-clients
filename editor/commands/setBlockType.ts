// https://github.com/ProseMirror/prosemirror-commands/blob/master/src/commands.js#L453

import { NodeType } from "prosemirror-model";
import { Transaction } from "prosemirror-state";

export function setBlockType(
  nodeType: NodeType,
  attrs: Record<string, any> = {}
) {
  return function (
    tr: Transaction,
    dispatch?: (tr: Transaction) => boolean | void
  ) {
    let { from, to } = tr.selection;
    let applicable = false;
    tr.doc.nodesBetween(from, to, (node, pos) => {
      if (applicable) return false;
      if (!node.isTextblock || node.hasMarkup(nodeType, attrs)) return;
      if (node.type == nodeType) {
        applicable = true;
      } else {
        let $pos = tr.doc.resolve(pos),
          index = $pos.index();
        applicable = $pos.parent.canReplaceWith(index, index + 1, nodeType);
      }
    });
    if (!applicable) return false;
    if (dispatch)
      dispatch(tr.setBlockType(from, to, nodeType, attrs).scrollIntoView());
    return true;
  };
}
