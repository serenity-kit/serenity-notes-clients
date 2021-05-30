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

  const menuItems = buildMenuItems(schema);
  const prosemirrorView = new EditorView(editor, {
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
          };
          // needed to make sure the selection is visible after the
          // iOS/Android software keyboard became active
          window.visualViewport.addEventListener("resize", scrollIntoView);
        }

        const proseMirror = document.getElementsByClassName("ProseMirror")[0];
        editorToolbar.style.height = "53px";
        proseMirror.style.height = "calc(100vh - 53px)";
      },
      blur: () => {
        if (isVisualViewportSupported) {
          window.visualViewport.removeEventListener("resize", scrollIntoView);
        }

        const proseMirror = document.getElementsByClassName("ProseMirror")[0];
        editorToolbar.style.height = "0px";
        proseMirror.style.height = "100vh";
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
});
