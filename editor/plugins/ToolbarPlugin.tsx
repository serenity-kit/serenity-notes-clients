import { EditorView } from "prosemirror-view";
import React from "react";
import ReactDOM from "react-dom";
import Toolbar from "../components/Toolbar";
import LinkPreview from "../components/LinkPreview";
import { schema } from "../schema";
import markActive from "../utils/markActive";

export default class ToolbarPlugin {
  editorView: EditorView;

  constructor(editorView: EditorView) {
    this.editorView = editorView;
    this.update();

    ReactDOM.render(
      <Toolbar editorView={editorView} />,
      document.getElementById("editor-toolbar")
    );
  }

  update() {
    ReactDOM.render(
      <LinkPreview
        editorView={this.editorView}
        mark={markActive(this.editorView.state, schema.marks.link)}
      />,
      document.getElementById("link-preview")
    );
    ReactDOM.render(
      <Toolbar editorView={this.editorView} />,
      document.getElementById("editor-toolbar")
    );
  }

  destroy() {
    // this.dom.remove();
  }
}
