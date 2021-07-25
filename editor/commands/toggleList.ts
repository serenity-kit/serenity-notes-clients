import { NodeType } from "prosemirror-model";
import { liftListItem } from "prosemirror-schema-list";
import findParentNode from "../utils/findParentNode";
import clearNodes from "../utils/clearNodes";
import { wrapInList } from "./wrapInList";
import { EditorState, Transaction } from "prosemirror-state";
import { Node as ProseMirrorNode } from "prosemirror-model";
import { schema } from "../schema";

function isList(node: ProseMirrorNode) {
  if (
    node.type === schema.nodes.bullet_list ||
    node.type === schema.nodes.ordered_list ||
    node.type === schema.nodes.checklist
  ) {
    return true;
  }
  return false;
}

export const toggleList =
  (listType: NodeType) =>
  (state: EditorState, dispatch?: (tr: Transaction) => boolean | void) => {
    const { selection } = state;
    const { $from, $to } = selection;
    const range = $from.blockRange($to);

    if (!range) {
      return false;
    }

    const parentList = findParentNode((node) => isList(node))(selection);

    if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
      // remove list
      if (parentList.node.type === listType) {
        if (listType === schema.nodes.checklist) {
          return liftListItem(schema.nodes.checklist_item)(state, dispatch);
        }
        return liftListItem(schema.nodes.list_item)(state, dispatch);
      }

      // change list type
      if (isList(parentList.node)) {
        // e.g. when changing from bullet to ordered list
        if (listType.validContent(parentList.node.content)) {
          if (dispatch) {
            dispatch(state.tr.setNodeMarkup(parentList.pos, listType));
          }
          return true;
          // e.g when chaning from bullet list to checklist or checklist to ordered list
        } else {
          const childCount = parentList.node.childCount;
          const $pos = state.doc.resolve(parentList.pos);
          const listStart = parentList.pos - $pos.textOffset;
          const listEnd = listStart + $pos.parent.child($pos.index()).nodeSize;
          const selectionRange = {
            $from: state.doc.resolve(listStart),
            $to: state.doc.resolve(listEnd),
          };
          const tr = clearNodes(state.tr, [selectionRange]);
          const selectionRangeAfterClearingNodes = {
            $from: tr.doc.resolve(listStart),
            // (2 + 2 * childCount) is the amount of positions removed
            // when clearing a list
            $to: tr.doc.resolve(listEnd - (2 + 2 * childCount)),
          };
          return wrapInList(listType)(
            tr,
            dispatch,
            selectionRangeAfterClearingNodes
          );
        }
      }
      return false;
    }

    const canWrapInList = wrapInList(listType)(state.tr);

    // try to convert node to paragraph if needed
    if (!canWrapInList) {
      const tr = clearNodes(state.tr);
      return wrapInList(listType)(tr, dispatch);
    }

    return wrapInList(listType)(state.tr, dispatch);
  };
