import { Mark, MarkType } from "prosemirror-model";
import { EditorState } from "prosemirror-state";

function rangeHasMark(
  state: EditorState,
  from: number,
  to: number,
  type: MarkType
) {
  let found: Mark | undefined = undefined;
  if (to > from)
    state.doc.nodesBetween(from, to, (node) => {
      if (!found) {
        // TODO double check this with multiple marks selected
        const firstMark = type.isInSet(node.marks);
        if (firstMark) {
          found = firstMark;
        }
      }
    });
  return found;
}

export default function markActive(state: EditorState, type: MarkType) {
  let { from, $from, to, empty } = state.selection;
  if (empty) return type.isInSet(state.storedMarks || $from.marks());
  else return rangeHasMark(state, from, to, type);
}
