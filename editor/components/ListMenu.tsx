import React from "react";
import { EditorView } from "prosemirror-view";
import { wrapInList } from "../commands/lists";
import { schema } from "../schema";
import HorizontalRule from "./HorizontalRule";
import CloseButton from "./CloseButton";
import Drawer from "./Drawer";
import ListButton from "./ListButton";
import { MdFormatListBulleted, MdFormatListNumbered } from "react-icons/md";
import ChecklistButton from "./CheckListButton";

type Props = {
  editorView: EditorView;
};

const bulletListCommand = wrapInList(schema.nodes.bullet_list);
const orderedListCommand = wrapInList(schema.nodes.ordered_list);
const checklistCommand = wrapInList(schema.nodes.checklist);

export default function ListMenu({ editorView }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const canWrapInList =
    bulletListCommand(editorView.state) ||
    orderedListCommand(editorView.state) ||
    checklistCommand(editorView.state);

  return (
    <>
      <Drawer
        editorView={editorView}
        height={260}
        onOpen={() => {
          setIsOpen(true);
        }}
        onClose={() => {
          setIsOpen(false);
        }}
        button={({ onPointerDown }) => (
          <button
            onPointerDown={onPointerDown}
            style={{
              border: "0 solid transparent",
              fontSize: 24,
              borderRadius: 8,
              background: isOpen ? "black" : "white",
              color: isOpen ? "white" : canWrapInList ? "black" : "#ccc",
              padding: "0rem 0.3rem 0.2rem",
              marginRight: "0.1rem",
            }}
          >
            <MdFormatListNumbered
              style={{
                display: "inline-block",
                verticalAlign: "middle",
              }}
            />
          </button>
        )}
      >
        {({ onPointerDownClose }) => (
          <div style={{ padding: "10px 20px 0 20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontWeight: 400,
                  fontSize: "20px",
                  alignSelf: "flex-end",
                }}
              >
                Lists
              </h2>
              <CloseButton onPointerDown={onPointerDownClose} />
            </div>
            <div
              style={{
                borderRadius: 8,
                border: "0.5px solid #ddd",
                width: "100%",
                marginTop: 15,
              }}
            >
              <ListButton
                editorView={editorView}
                nodeType={schema.nodes.bullet_list}
                icon={MdFormatListBulleted}
                title="Wrap in bullet list"
                style={{
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                }}
              >
                Bullet list
              </ListButton>
              <HorizontalRule />
              <ListButton
                editorView={editorView}
                nodeType={schema.nodes.ordered_list}
                icon={MdFormatListNumbered}
                title="Wrap in ordered list"
              >
                Ordered list
              </ListButton>
              <HorizontalRule />
              <ChecklistButton
                editorView={editorView}
                nodeType={schema.nodes.checklist}
                title="Wrap in checklist"
                style={{
                  borderBottomLeftRadius: "8px",
                  borderBottomRightRadius: "8px",
                }}
              >
                Checklist
              </ChecklistButton>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
