import React from "react";
import { EditorView } from "prosemirror-view";
import { wrapInList } from "../commands/lists";
import { IconType } from "react-icons/lib";
import { classNames } from "./classnames";

type Props = {
  editorView: EditorView;
  nodeType: any;
  icon: IconType;
  title: string;
};

export default function ListButton({
  editorView,
  icon,
  nodeType,
  title,
}: Props) {
  const command = wrapInList(nodeType);
  const canWrap = command(editorView.state);
  const Icon = icon;

  const cx = classNames("ToolbarIcon", canWrap && "enabled");

  return (
    <button
      title={title}
      onMouseDown={(evt) => {
        evt.preventDefault();
        command(editorView.state, editorView.dispatch);
      }}
      style={{
        border: "0 solid transparent",
        fontSize: 24,
        borderRadius: 4,
        padding: "0rem 0.3rem 0.2rem",
        marginRight: "0.1rem",
      }}
      className={cx}
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
