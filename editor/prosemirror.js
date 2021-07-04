/* eslint-env browser */

import * as Y from "yjs";
import {
  ySyncPlugin,
  //, yCursorPlugin, yUndoPlugin, undo, redo
} from "y-prosemirror";
import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "./schema";
import { exampleSetup, buildMenuItems } from "prosemirror-example-setup";
import { keymap } from "prosemirror-keymap";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import {
  splitListItem,
  liftListItem,
  sinkListItem,
} from "prosemirror-schema-list";

function toolbarPlugin() {
  return new Plugin({
    view(editorView) {
      return new ToolbarPlugin(editorView);
    },
  });
}

function toggleChecklistItemAction(state, pos, checklistItemNode) {
  return state.tr.setNodeMarkup(pos, null, {
    checked: !checklistItemNode.attrs.checked,
  });
}

const isVisualViewportSupported = "visualViewport" in window;
let scrollIntoView;

window.addEventListener("load", () => {
  const ydoc = new Y.Doc();
  window.ydoc = ydoc;
  const type = ydoc.getXmlFragment("document");
  ydoc.on("update", (update) => {
    // console.log(
    //   "update: ",
    //   update,
    //   JSON.stringify(Array.from(update)),
    //   ydoc.clientID
    // );
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(Array.from(update)));
    }
  });

  const editor = document.getElementById("editor");
  const editorToolbar = document.getElementById("editor-toolbar");

  if (window.isDesktop) {
    const css = `
    #editor-toolbar {
      height: 53px;
      top: 0;
      border-bottom: 1px solid #ddd;
      border-top: 0 solid #ddd;
    }

    .ProseMirror {
      margin-top: 53px;
      height: calc(100vh - 53px);
    }
    `;
    const styleTag = document.createElement("style");

    document.head.appendChild(styleTag);
    styleTag.appendChild(document.createTextNode(css));
  }

  const menuItems = buildMenuItems(schema);
  new EditorView(editor, {
    state: EditorState.create({
      schema: schema,
      plugins: [
        ySyncPlugin(type),
        // yUndoPlugin(),
        // keymap({
        //   'Mod-z': undo,
        //   'Mod-y': redo,
        //   'Mod-Shift-z': redo
        // })
        toolbarPlugin(),
        keymap({
          Enter: splitListItem(schema.nodes.checklist_item),
          "Mod-[": liftListItem(schema.nodes.checklist_item),
          "Mod-]": sinkListItem(schema.nodes.checklist_item),
        }),
      ].concat(
        exampleSetup({
          schema: schema,
          menuBar: false,
          menuContent: [
            menuItems.fullMenu[0],
            [
              menuItems.blockMenu[0][0],
              menuItems.blockMenu[0][1],
              menuItems.blockMenu[0][3],
              // menuItems.blockMenu[0][2], // merge with top
            ],
            menuItems.fullMenu[2],
          ],
        })
      ),
    }),
    handleDOMEvents: {
      // handling checklist touch with onmousedown to make sure
      // preventDefault can prevent the focus event to happen
      mousedown: (editorView, event) => {
        if (event.target.classList.contains("on-click-check")) {
          event.preventDefault();

          const pos = editorView.posAtDOM(event.target);
          const node = editorView.state.doc.resolve(pos).parent;
          editorView.dispatch(
            toggleChecklistItemAction(editorView.state, pos - 1, node)
          );
          return true;
        }
        return false;
      },
      focus: (view) => {
        if (isVisualViewportSupported) {
          scrollIntoView = () => {
            view.dispatch(view.state.tr.scrollIntoView());
            // on iOS and possibly Android as well sometimes scrollIntoView
            // doesn't work always directly, but it works every time with a
            // delay
            setTimeout(() => {
              view.dispatch(view.state.tr.scrollIntoView());
            }, 100);
          };
          // needed to make sure the selection is visible after the
          // iOS/Android software keyboard became active
          window.visualViewport.addEventListener("resize", scrollIntoView);
        }

        if (!window.isDesktop) {
          const proseMirror = document.getElementsByClassName("ProseMirror")[0];
          editorToolbar.style.height = "53px";
          proseMirror.style.height = "calc(100vh - 53px)";
        }
      },
      blur: () => {
        if (isVisualViewportSupported) {
          window.visualViewport.removeEventListener("resize", scrollIntoView);
        }

        if (!window.isDesktop) {
          const proseMirror = document.getElementsByClassName("ProseMirror")[0];
          editorToolbar.style.height = "0px";
          proseMirror.style.height = "100vh";
        }
      },
    },
  });

  // @ts-ignore
  // window.example = { ydoc, type, prosemirrorView }
  window.applyYjsUpdate = function (updateArray) {
    if (updateArray) {
      const update = new Uint8Array(updateArray);
      Y.applyUpdate(window.ydoc, update);
    }
  };

  // applyYjsUpdate([
  //   2, 13, 233, 147, 182, 182, 11, 0, 132, 161, 166, 249, 191, 7, 22, 5, 84,
  //   111, 100, 97, 121, 0, 20, 71, 161, 166, 249, 191, 7, 33, 6, 4, 0, 233, 147,
  //   182, 182, 11, 25, 3, 83, 104, 105, 129, 233, 147, 182, 182, 11, 28, 2, 132,
  //   233, 147, 182, 182, 11, 30, 2, 112, 32, 129, 233, 147, 182, 182, 11, 32, 1,
  //   132, 233, 147, 182, 182, 11, 33, 4, 105, 110, 117, 120, 196, 233, 147, 182,
  //   182, 11, 33, 233, 147, 182, 182, 11, 34, 1, 76, 132, 233, 147, 182, 182, 11,
  //   37, 7, 32, 99, 108, 105, 101, 110, 116, 132, 161, 166, 249, 191, 7, 48, 12,
  //   83, 105, 103, 110, 32, 117, 112, 32, 102, 111, 114, 32, 129, 233, 147, 182,
  //   182, 11, 57, 12, 132, 233, 147, 182, 182, 11, 69, 20, 115, 101, 99, 117,
  //   114, 105, 116, 121, 32, 99, 111, 110, 102, 101, 114, 101, 110, 99, 101, 115,
  //   21, 161, 166, 249, 191, 7, 0, 1, 1, 8, 100, 111, 99, 117, 109, 101, 110,
  //   116, 1, 0, 7, 71, 161, 166, 249, 191, 7, 0, 3, 7, 104, 101, 97, 100, 105,
  //   110, 103, 7, 0, 161, 166, 249, 191, 7, 8, 6, 1, 0, 161, 166, 249, 191, 7, 9,
  //   6, 40, 0, 161, 166, 249, 191, 7, 8, 5, 108, 101, 118, 101, 108, 1, 125, 2,
  //   129, 161, 166, 249, 191, 7, 15, 6, 193, 161, 166, 249, 191, 7, 8, 161, 166,
  //   249, 191, 7, 0, 1, 199, 161, 166, 249, 191, 7, 8, 161, 166, 249, 191, 7, 23,
  //   3, 9, 99, 104, 101, 99, 107, 108, 105, 115, 116, 7, 0, 161, 166, 249, 191,
  //   7, 24, 3, 14, 99, 104, 101, 99, 107, 108, 105, 115, 116, 95, 105, 116, 101,
  //   109, 7, 0, 161, 166, 249, 191, 7, 25, 3, 9, 112, 97, 114, 97, 103, 114, 97,
  //   112, 104, 40, 0, 161, 166, 249, 191, 7, 25, 7, 99, 104, 101, 99, 107, 101,
  //   100, 1, 121, 1, 0, 161, 166, 249, 191, 7, 26, 1, 0, 4, 65, 161, 166, 249,
  //   191, 7, 28, 1, 0, 6, 135, 161, 166, 249, 191, 7, 25, 3, 14, 99, 104, 101,
  //   99, 107, 108, 105, 115, 116, 95, 105, 116, 101, 109, 7, 0, 161, 166, 249,
  //   191, 7, 40, 3, 9, 112, 97, 114, 97, 103, 114, 97, 112, 104, 40, 0, 161, 166,
  //   249, 191, 7, 40, 7, 99, 104, 101, 99, 107, 101, 100, 1, 121, 7, 0, 161, 166,
  //   249, 191, 7, 41, 6, 1, 0, 161, 166, 249, 191, 7, 43, 5, 2, 161, 166, 249,
  //   191, 7, 5, 0, 8, 10, 6, 17, 7, 28, 12, 44, 5, 233, 147, 182, 182, 11, 4, 5,
  //   20, 29, 2, 33, 1, 58, 12,
  // ]);
});
