import { EditorView } from "prosemirror-view";
import React from "react";
import ReactDOM from "react-dom";
import Toolbar from "../components/Toolbar";

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
      <Toolbar editorView={this.editorView} />,
      document.getElementById("editor-toolbar")
    );
  }

  destroy() {
    // this.dom.remove();
  }
}
