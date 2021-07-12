import React from "react";
import { EditorView } from "prosemirror-view";
import { BiParagraph, BiHeading } from "react-icons/bi";
import { MdCode } from "react-icons/md";
import { setBlockType } from "prosemirror-commands";
import { schema } from "../schema";
import BlockTypeButton from "./BlockTypeButton";
import HorizontalRule from "./HorizontalRule";
import CloseButton from "./CloseButton";
import Drawer from "./Drawer";

type Props = {
  editorView: EditorView;
};

const paragraphCommand = setBlockType(schema.nodes.paragraph);
const heading2Command = setBlockType(schema.nodes.heading, {
  level: 2,
  ychange: null,
});
const heading3Command = setBlockType(schema.nodes.heading, {
  level: 3,
  ychange: null,
});
const codeBlockCommand = setBlockType(schema.nodes.code_block);

export default function BlockTypeMenu({ editorView }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const canChangeBlockType =
    paragraphCommand(editorView.state) ||
    heading2Command(editorView.state) ||
    heading3Command(editorView.state) ||
    codeBlockCommand(editorView.state);

  return (
    <>
      <Drawer
        editorView={editorView}
        height={305}
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
              fontSize: 22,
              borderRadius: 8,
              padding: "5px 0.3rem 0.2rem 0.3rem",
              marginRight: "0.1rem",
              verticalAlign: "bottom",
              background: isOpen ? "black" : "white",
              color: isOpen ? "white" : canChangeBlockType ? "black" : "#ccc",
            }}
          >
            Aa
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
                Format
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
              <BlockTypeButton
                nodeType={schema.nodes.heading}
                attrs={{ level: 2, ychange: null }}
                editorView={editorView}
                icon={BiHeading}
                title="Change to heading 2"
                style={{
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                }}
              >
                Heading
              </BlockTypeButton>
              <HorizontalRule />
              <BlockTypeButton
                nodeType={schema.nodes.heading}
                attrs={{ level: 3, ychange: null }}
                editorView={editorView}
                icon={BiHeading}
                title="Change to heading 3"
              >
                Subheading
              </BlockTypeButton>
              <HorizontalRule />
              <BlockTypeButton
                nodeType={schema.nodes.paragraph}
                editorView={editorView}
                icon={BiParagraph}
                title="Change to paragraph"
              >
                Body
              </BlockTypeButton>
              <HorizontalRule />
              <BlockTypeButton
                nodeType={schema.nodes.code_block}
                editorView={editorView}
                icon={MdCode}
                title="Change to code block"
                style={{
                  borderBottomLeftRadius: "8px",
                  borderBottomRightRadius: "8px",
                }}
              >
                Code
              </BlockTypeButton>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
