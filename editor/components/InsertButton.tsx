import React from "react";
import { EditorView } from "prosemirror-view";
import { TextSelection } from "prosemirror-state";
import canInsert from "../utils/canInsert";
import { IconType } from "react-icons/lib";
import Button from "./Button";
import CSS from "csstype";

type Props = {
  editorView: EditorView;
  nodeType: any;
  icon: IconType;
  children?: React.ReactNode;
  title: string;
  style?: CSS.Properties;
};

export default function InsertButton({
  editorView,
  icon,
  nodeType,
  title,
  style,
  children,
}: Props) {
  const canInsertNode = canInsert(editorView.state, nodeType);
  const Icon = icon;

  return (
    <Button
      title={title}
      onMouseDown={(evt) => {
        evt.preventDefault();
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
      canDoCommand={canInsertNode}
      style={style}
    >
      <Icon
        style={{
          fontSize: 24,
          display: "inline-block",
          verticalAlign: "middle",
          marginRight: 10,
        }}
      />
      {children}
    </Button>
  );
}
