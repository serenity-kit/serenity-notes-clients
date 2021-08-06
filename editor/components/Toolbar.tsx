import React from "react";
import { EditorView } from "prosemirror-view";
import { undo, redo } from "prosemirror-history";
import { schema } from "../schema";
import ToggleMarkButton from "./ToggleMarkButton";
import ListIconButton from "./ListIconButton";
import WrapInIconButton from "./WrapInIconButton";
import ChecklistIconButton from "./ChecklistIconButton";
import CommandButton from "./CommandButton";
import ListCommandButton from "./ListCommandButton";
import BlockTypeIconButton from "./BlockTypeIconButton";
import BlockTypeMenu from "./BlockTypeMenu";
import { sinkListItem, liftListItem } from "prosemirror-schema-list";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatIndentDecrease,
  MdFormatIndentIncrease,
  MdUndo,
  MdRedo,
  MdCode,
  MdFormatQuote,
  MdRemove,
} from "react-icons/md";
import { BiParagraph, BiHeading } from "react-icons/bi";
import * as theme from "../theme";
import ListMenu from "./ListMenu";
import LinkMenu from "./LinkMenu";
import MiscellaneousMenu from "./MiscellaneousMenu";
import InsertIconButton from "./InsertIconButton";
import useWindowSize from "../hooks/useWindowSize";

const miscellaneousMenuBreakPoint = 660;
const blockTypeMenuBreakPoint = 590;
const listMenuBreakPoint = 470;

type Props = {
  editorView: EditorView;
};

export default function Toolbar({ editorView }: Props) {
  const windowSize = useWindowSize();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        margin: "0.5rem 0.2rem",
      }}
    >
      <div style={{ display: "flex" }}>
        <ToggleMarkButton
          editorView={editorView}
          mark={schema.marks.strong}
          icon={MdFormatBold}
          title="Toggle strong style"
        />
        <ToggleMarkButton
          editorView={editorView}
          mark={schema.marks.em}
          icon={MdFormatItalic}
          title="Toggle emphasis style"
        />
        <ToggleMarkButton
          editorView={editorView}
          mark={schema.marks.code}
          icon={MdCode}
          title="Toggle code style"
        />
        {windowSize.width > miscellaneousMenuBreakPoint ? (
          <LinkMenu editorView={editorView} iconMode />
        ) : null}
        <span
          style={{
            borderRight: `0.5px solid ${theme.colors.divider}`,
            marginRight: "2px",
          }}
        ></span>
        {windowSize.width > blockTypeMenuBreakPoint ? (
          <>
            <BlockTypeIconButton
              nodeType={schema.nodes.paragraph}
              editorView={editorView}
              icon={BiParagraph}
              title="Change to paragraph"
            />
            <BlockTypeIconButton
              nodeType={schema.nodes.heading}
              attrs={{ level: 2, ychange: null }}
              editorView={editorView}
              icon={BiHeading}
              title="Change to heading 2"
            />
            <BlockTypeIconButton
              nodeType={schema.nodes.heading}
              attrs={{ level: 3, ychange: null }}
              editorView={editorView}
              icon={BiHeading}
              title="Change to heading 3"
              headingLevelTwo
              style={{ marginRight: "10px" }}
            />
            <BlockTypeIconButton
              nodeType={schema.nodes.code_block}
              editorView={editorView}
              icon={MdCode}
              title="Change to code block"
            />
          </>
        ) : (
          <BlockTypeMenu editorView={editorView} />
        )}
        {windowSize.width > listMenuBreakPoint ? (
          <>
            <ListIconButton
              editorView={editorView}
              nodeType={schema.nodes.bullet_list}
              icon={MdFormatListBulleted}
              title="Wrap in bullet list"
            />
            <ListIconButton
              editorView={editorView}
              nodeType={schema.nodes.ordered_list}
              icon={MdFormatListNumbered}
              title="Wrap in ordered list"
            />
            <ChecklistIconButton
              editorView={editorView}
              nodeType={schema.nodes.checklist}
              title="Wrap in checklist"
            />
          </>
        ) : (
          <ListMenu editorView={editorView} />
        )}
        {windowSize.width > miscellaneousMenuBreakPoint ? (
          <>
            <WrapInIconButton
              editorView={editorView}
              nodeType={schema.nodes.blockquote}
              icon={MdFormatQuote}
              title="Wrap in blockquote"
            />
            <InsertIconButton
              editorView={editorView}
              nodeType={schema.nodes.horizontal_rule}
              icon={MdRemove}
              title="Insert horizontal line"
            />
          </>
        ) : (
          <MiscellaneousMenu editorView={editorView} />
        )}

        <ListCommandButton
          command={sinkListItem}
          editorView={editorView}
          icon={MdFormatIndentIncrease}
          title="Sink list"
        />
        <ListCommandButton
          command={liftListItem}
          editorView={editorView}
          icon={MdFormatIndentDecrease}
          title="Lift out of enclosing block"
        />
      </div>
      <div style={{ display: "flex" }}>
        <CommandButton
          command={undo}
          editorView={editorView}
          icon={MdUndo}
          title="Undo"
        />
        <CommandButton
          command={redo}
          editorView={editorView}
          icon={MdRedo}
          title="Redo"
        />
      </div>
    </div>
  );
}
