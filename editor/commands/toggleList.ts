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
      if (
        isList(parentList.node) &&
        listType.validContent(parentList.node.content)
      ) {
        if (dispatch) {
          // TODO make it work for checklists and vice versa
          // instead of changing the nodeMarkup change the Nodemarkup for every item in the list
          dispatch(state.tr.setNodeMarkup(parentList.pos, listType));
        }

        return true;
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
