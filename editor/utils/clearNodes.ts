import { liftTarget } from "prosemirror-transform";
import { Transaction } from "prosemirror-state";

export default function clearNodes(tr: Transaction) {
  const { selection } = tr;
  const { ranges } = selection;
  let newTr = tr;

  ranges.forEach((range) => {
    tr.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
      if (node.type.isText) {
        return;
      }

      const $fromPos = tr.doc.resolve(tr.mapping.map(pos));
      const $toPos = tr.doc.resolve(tr.mapping.map(pos + node.nodeSize));
      const nodeRange = $fromPos.blockRange($toPos);

      if (!nodeRange) {
        return false;
      }

      const targetLiftDepth = liftTarget(nodeRange);

      if (node.type.isTextblock) {
        const { defaultType } = $fromPos.parent.contentMatchAt(
          $fromPos.index()
        );

        newTr = tr.setNodeMarkup(nodeRange.start, defaultType);
      }

      if (targetLiftDepth || targetLiftDepth === 0) {
        newTr = tr.lift(nodeRange, targetLiftDepth);
      }
    });
  });

  return newTr;
}
