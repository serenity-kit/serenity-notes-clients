import React from "react";
import { EditorView } from "prosemirror-view";
import { toggleMark } from "prosemirror-commands";
import { IconType } from "react-icons/lib";
import { classNames } from "./classnames";

function markActive(state: any, type: any) {
  let { from, $from, to, empty } = state.selection;
  if (empty) return type.isInSet(state.storedMarks || $from.marks());
  else return state.doc.rangeHasMark(from, to, type);
}

type Props = {
  editorView: EditorView;
  mark: any;
  icon: IconType;
  title: string;
};

export default function ToggleMarkButton({
  editorView,
  icon,
  mark,
  title,
}: Props) {
  const isBold = markActive(editorView.state, mark);
  const Icon = icon;

  const cx = classNames("ToolbarMark", isBold && "enabled");

  return (
    <button
      title={title}
      onMouseDown={(evt) => {
        evt.preventDefault();
        const command = toggleMark(mark);
        command(editorView.state, editorView.dispatch);
      }}
      style={{
        border: "0 solid transparent",
        fontSize: 26,
        borderRadius: 4,
        padding: "0rem 0.3rem 0.2rem",
        marginRight: "0.1rem",
      }}
      className={cx}
    >
      <Icon
        style={{
          fill: "currentcolor",
          display: "inline-block",
          verticalAlign: "middle",
        }}
      />
    </button>
  );
}
