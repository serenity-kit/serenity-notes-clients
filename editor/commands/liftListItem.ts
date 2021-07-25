import { EditorState, Transaction } from "prosemirror-state";
import { liftListItem as originalLiftListItem } from "prosemirror-schema-list";
import { schema } from "../schema";

export default function sinkListItem(
  state: EditorState<any>,
  dispatch: ((tr: Transaction<any>) => void) | undefined
) {
  return (
    originalLiftListItem(schema.nodes.checklist_item)(state, dispatch) ||
    originalLiftListItem(schema.nodes.list_item)(state, dispatch)
  );
}
