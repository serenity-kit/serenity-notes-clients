import React, { useRef, useState } from "react";
import { EditorView } from "prosemirror-view";
import { MdLink } from "react-icons/md";
import { schema } from "../schema";
// import setMark from "../utils/setMark";
import { toggleMark } from "prosemirror-commands";
import CloseButton from "./CloseButton";
import Drawer from "./Drawer";
import {
  closeToolbar,
  openToolbar,
  setActiveDrawer,
} from "../utils/toolbarState";

type Props = {
  editorView: EditorView;
};

export default function BlockTypeMenu({ editorView }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  // const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);

  const canChangeBlockType = true;

  return (
    <>
      <Drawer
        editorView={editorView}
        height={200}
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
          <button
            onPointerDown={onPointerDown}
            style={{
              border: "0 solid transparent",
              fontSize: 22,
              borderRadius: 8,
              padding: "5px 0.3rem 0.2rem 0.3rem",
              marginRight: "0.1rem",
              verticalAlign: "bottom",
              background: isOpen ? "black" : "white",
              color: isOpen ? "white" : canChangeBlockType ? "black" : "#ccc",
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
                borderRadius: 8,
                border: "0.5px solid #ddd",
                width: "100%",
                marginTop: 15,
              }}
            >
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setActiveDrawer(undefined);
                  close();
                  // TODO insert vs just apply
                  // editorView.dispatch(
                  //   setMark(schema.marks.link, { href: link }, editorView)
                  // );
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
                <input
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
                <button>Submit</button>
              </form>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
