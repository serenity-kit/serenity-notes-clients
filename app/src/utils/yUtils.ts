import { Y } from "../vendor/index.js";

const getFirstYText = (element) => {
  if (element.length > 0 && typeof element.toArray === "function") {
    return getFirstYText(element.toArray()[0]);
  }
  return element;
};

export const extractDocumentName = (content: Uint8Array) => {
  let name = "Untitled";

  const yDoc = new Y.Doc();
  Y.applyUpdate(yDoc, content);
  const yText = getFirstYText(yDoc.getXmlFragment("document"));
  if (yText.length > 0) {
    name = yText
      .toString()
      .replace("<strong>", "")
      .replace("</strong>", "")
      .replace("<em><strong>", "")
      .replace("</strong></em>", "")
      .replace("<em>", "")
      .replace("</em>", "");
  }
  return name;
};
