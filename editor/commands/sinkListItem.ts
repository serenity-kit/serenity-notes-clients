import { EditorState, Transaction } from "prosemirror-state";
import { sinkListItem as originalSinkListItem } from "prosemirror-schema-list";
import { schema } from "../schema";

export default function sinkListItem(
  state: EditorState<any>,
  dispatch: ((tr: Transaction<any>) => void) | undefined
) {
  return (
    originalSinkListItem(schema.nodes.checklist_item)(state, dispatch) ||
    originalSinkListItem(schema.nodes.list_item)(state, dispatch)
  );
}
