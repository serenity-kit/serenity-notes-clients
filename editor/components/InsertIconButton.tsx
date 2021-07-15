import React from "react";
import { EditorView } from "prosemirror-view";
import { TextSelection } from "prosemirror-state";
import canInsert from "../utils/canInsert";
import { IconType } from "react-icons/lib";

type Props = {
  editorView: EditorView;
  nodeType: any;
  icon: IconType;
  title: string;
};

export default function InsertIconButton({
  editorView,
  icon,
  nodeType,
  title,
}: Props) {
  const canInsertNode = canInsert(editorView.state, nodeType);
  const Icon = icon;

  return (
    <button
      title={title}
      onMouseDown={(evt) => {
        evt.preventDefault();
        // TODO extract to same function as in InsertButton
        const action = editorView.state.tr.replaceSelectionWith(
          nodeType.create()
        );
        const { parent, pos } = action.selection.$from;
        const posAfter = pos + 1;
        const nodeAfter = action.doc.nodeAt(posAfter);

        // end of document
        if (!nodeAfter) {
          const node = parent.type.contentMatch.defaultType?.create();
          if (node) {
            action
              .insert(posAfter, node)
              .setSelection(TextSelection.create(action.doc, posAfter))
              .scrollIntoView();
          }
        }

        editorView.dispatch(action);
      }}
      style={{
        border: "0 solid transparent",
        fontSize: 26,
        borderRadius: 8,
        background: "white",
        color: canInsertNode ? "black" : "#ccc",
        padding: "5px",
        marginRight: "2px",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <Icon
        style={{
          display: "inline-block",
          verticalAlign: "middle",
        }}
      />
    </button>
  );
}
