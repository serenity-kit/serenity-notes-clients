import React, { useRef, useState } from "react";
import { EditorView } from "prosemirror-view";
import { MdLink } from "react-icons/md";
import { schema } from "../schema";
import { toggleMark } from "prosemirror-commands";
import CloseButton from "./CloseButton";
import Drawer from "./Drawer";
import Button from "./Button";
import TextInput from "./TextInput";
import {
  closeToolbar,
  openToolbar,
  setActiveDrawer,
} from "../utils/toolbarState";
import * as theme from "../theme";
import markActive from "../utils/markActive";

type Props = {
  editorView: EditorView;
  iconMode?: boolean;
};

export default function BlockTypeMenu({ editorView, iconMode }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  // const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);

  const canDoCommand = !editorView.state.selection.empty;

  return (
    <>
      <Drawer
        editorView={editorView}
        height={235}
        onOpen={(uniqueDrawerId) => {
          setActiveDrawer(uniqueDrawerId);
          setIsOpen(true);
          setTimeout(() => {
            linkInputRef.current?.focus();
            // 0 or 1 was too short for iOS Safari
          }, 10);
        }}
        onClose={(uniqueDrawerId) => {
          setActiveDrawer(undefined);
          setIsOpen(false);
          editorView.focus();
          openToolbar();
        }}
        button={({ onPointerDown }) => (
          <>
            {iconMode ? (
              <button
                disabled={canDoCommand}
                onPointerDown={(event) => {
                  if (!canDoCommand) return;
                  onPointerDown(event);
                }}
                style={{
                  border: "0 solid transparent",
                  fontSize: 24,
                  borderRadius: 8,
                  background: isOpen ? "black" : "white",
                  color: isOpen ? "white" : canDoCommand ? "black" : "#ccc",
                  padding: "0rem 0.3rem 0.2rem",
                  marginRight: "0.1rem",
                }}
                data-serenity-ignore-drawer-dragging="true"
              >
                <MdLink
                  style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                />
              </button>
            ) : (
              <Button
                onPointerDown={(event) => {
                  if (!canDoCommand) return;
                  onPointerDown(event);
                }}
                disabled={!canDoCommand}
                canDoCommand={canDoCommand}
                data-serenity-ignore-drawer-dragging="true"
                style={{
                  borderBottomLeftRadius: "8px",
                  borderBottomRightRadius: "8px",
                }}
              >
                <MdLink
                  style={{
                    fontSize: 24,
                    display: "inline-block",
                    verticalAlign: "middle",
                    marginRight: 10,
                  }}
                />
                Link
              </Button>
            )}
          </>
        )}
      >
        {({ onPointerDownClose, close }) => (
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
                Link
              </h2>
              <CloseButton onPointerDown={onPointerDownClose} />
            </div>
            <div
              style={{
                width: "100%",
                marginTop: 15,
              }}
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setActiveDrawer(undefined);
                  close();

                  // remove the active link before applying the new one
                  if (markActive(editorView.state, schema.marks.link)) {
                    toggleMark(schema.marks.link, {})(
                      editorView.state,
                      editorView.dispatch
                    );
                  }
                  toggleMark(schema.marks.link, { href: link })(
                    editorView.state,
                    editorView.dispatch
                  );
                  editorView.focus();
                  editorView.dispatch(editorView.state.tr.scrollIntoView());
                  setLink("");
                }}
              >
                {/* TODO only show the text input in case nothing is collapsed */}
                {/* <input
                  type="text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                /> */}
                <TextInput
                  placeholder="www.example.com"
                  type="text"
                  value={link}
                  onChange={(event) => setLink(event.target.value)}
                  ref={linkInputRef}
                  onBlur={() => {
                    setActiveDrawer(undefined);
                    close();
                    closeToolbar();
                  }}
                />
                <Button
                  canDoCommand={link !== ""}
                  disabled={link === ""}
                  style={{
                    fontSize: 16,
                    backgroundColor: theme.colors.white,
                    lineHeight: "22px",
                    borderRadius: 6,
                    border: `0.5px solid ${theme.colors.divider}`,
                    width: "100%",
                    justifyContent: "center",
                    marginTop: 15,
                  }}
                >
                  Apply Link
                </Button>
              </form>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
