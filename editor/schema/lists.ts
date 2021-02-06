// Inpired by of https://github.com/ProseMirror/prosemirror-schema-list
const olDOM = ["ol", 0];
const ulDOM = ["ul", 0];
const liDOM = ["li", 0];

export const orderedList = {
  group: "block",
  content: "list_item+",
  attrs: { order: { default: 1 } },
  parseDOM: [
    {
      tag: "ol",
      getAttrs(dom: any) {
        return {
          order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1,
        };
      },
    },
  ],
  toDOM(node: any) {
    return node.attrs.order == 1
      ? olDOM
      : ["ol", { start: node.attrs.order }, 0];
  },
};

export const bulletList = {
  group: "block",
  content: "list_item+",
  parseDOM: [{ tag: "ul" }],
  toDOM() {
    return ulDOM;
  },
};

export const listItem = {
  content: "paragraph (paragraph | bullet_list | ordered_list | checklist)*",
  parseDOM: [{ tag: "li" }],
  toDOM() {
    return liDOM;
  },
  defining: true,
};

export const checklist = {
  group: "block",
  content: "checklist_item+",
  toDOM() {
    return ["ul", { "data-type": "checklist" }, 0];
  },
  parseDOM: [
    {
      priority: 51, // needs higher priority than other nodes that use a "ul" tag
      tag: '[data-type="checklist"]',
    },
  ],
};

export const checklistItem = {
  attrs: {
    checked: { default: false },
  },
  content: "paragraph (paragraph | bullet_list | ordered_list | checklist)*",
  defining: true,
  toDOM(node: any) {
    const { checked } = node.attrs;

    return [
      "li",
      { "data-type": "checklist_item", "data-checked": checked.toString() },
      [
        "span",
        {
          class: "checklist-checkbox-wrapper on-click-check",
          contenteditable: "false",
        },
        [
          "span",
          { class: "checklist-checkbox on-click-check" },
          [
            "span",
            { class: "check on-click-check" },
            ["span", { class: "check-stem on-click-check" }],
            ["span", { class: "check-kick on-click-check" }],
          ],
        ],
      ],
      ["div", { class: "checklist-content" }, 0],
    ];
  },
  parseDOM: [
    {
      priority: 51, // needs higher priority than other nodes that use a "li" tag
      tag: '[data-type="checklist_item"]',
      getAttrs(dom: any) {
        return {
          checked: dom.getAttribute("data-checked") === "true",
        };
      },
    },
  ],
};
