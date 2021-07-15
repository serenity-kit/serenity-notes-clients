import React from "react";
import { EditorView } from "prosemirror-view";
import { MdAddCircleOutline, MdFormatQuote, MdRemove } from "react-icons/md";
import { schema } from "../schema";
import InsertButton from "./InsertButton";
import HorizontalRule from "./HorizontalRule";
import CloseButton from "./CloseButton";
import Drawer from "./Drawer";
import WrapInButton from "./WrapInButton";
import LinkMenu from "./LinkMenu";

type Props = {
  editorView: EditorView;
};

export default function MiscellaneousMenu({ editorView }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);

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
              color: isOpen ? "white" : "black",
              padding: "0rem 0.3rem 0.2rem",
              marginRight: "0.1rem",
            }}
          >
            <MdAddCircleOutline
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
                Miscellaneous
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
              <WrapInButton
                nodeType={schema.nodes.blockquote}
                editorView={editorView}
                icon={MdFormatQuote}
                title="Wrap in blockquote"
                style={{
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                }}
              >
                Block quote
              </WrapInButton>
              <HorizontalRule />
              <InsertButton
                nodeType={schema.nodes.horizontal_rule}
                editorView={editorView}
                icon={MdRemove}
                title="Insert horizontal line"
              >
                Horizontal line
              </InsertButton>
              <HorizontalRule />
              <LinkMenu editorView={editorView} />
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
