import React from "react";
import { EditorView } from "prosemirror-view";
import { Mark } from "prosemirror-model";
import { toggleMark } from "prosemirror-commands";
import * as theme from "../theme";
import { schema } from "../schema/index";
import Button from "./Button";
import { getValidUrl } from "../utils/getValidUrl";

type Props = {
  editorView: EditorView;
  mark?: boolean | Mark<any> | null | undefined;
};

const css = window.isDesktop
  ? `
  #link-preview {
    position: fixed;
    top: 53px;
    left: 0;
    right: 0;
    z-index: 10;
    border-bottom: ;
  }
  `
  : `
  #link-preview {
    position: fixed;
    bottom: 53px;
    left: 0;
    right: 0;
    z-index: 10;
  }
  `;
const styleTag = document.createElement("style");

document.head.appendChild(styleTag);
styleTag.appendChild(document.createTextNode(css));

export default function LinkPreview({ editorView, mark }: Props) {
  if (!mark) return null;

  const link = getValidUrl(mark.attrs.href);

  return (
    <div
      style={{
        borderTop: window.isDesktop ? 0 : `0.5px solid ${theme.colors.divider}`,
        borderBottom: window.isDesktop
          ? `0.5px solid ${theme.colors.divider}`
          : 0,
        backgroundColor: theme.colors.background,
        padding: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            marginRight: 10,
            width: "50%",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            maxWidth: "50%",
            minWidth: "50%",
          }}
        >
          {link}
        </div>
        <Button
          canDoCommand
          onMouseDown={(event) => {
            event.preventDefault();
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({ type: "openLink", link })
              );
            }
          }}
          style={{
            justifyContent: "center",
            fontSize: 16,
            backgroundColor: theme.colors.white,
            lineHeight: "22px",
            borderRadius: 6,
            border: `0.5px solid ${theme.colors.divider}`,
            padding: 10,
            marginRight: 10,
          }}
        >
          Open
        </Button>
        <Button
          canDoCommand
          onMouseDown={(event) => {
            event.preventDefault();
            toggleMark(schema.marks.link, {})(
              editorView.state,
              editorView.dispatch
            );
          }}
          style={{
            justifyContent: "center",
            fontSize: 16,
            backgroundColor: theme.colors.white,
            lineHeight: "22px",
            borderRadius: 6,
            border: `0.5px solid ${theme.colors.divider}`,
            padding: 10,
          }}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
