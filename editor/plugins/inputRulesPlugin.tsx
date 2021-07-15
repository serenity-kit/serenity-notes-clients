import {
  emDash,
  ellipsis,
  inputRules,
  smartQuotes,
  wrappingInputRule,
  textblockTypeInputRule,
  InputRule,
} from "prosemirror-inputrules";
import { schema } from "../schema/index";
import nodeInputRule from "../utils/nodeInputRule";

const leftArrow = new InputRule(/<-$/, "←");
const rightArrow = new InputRule(/->$/, "→");
const copyright = new InputRule(/\(c\)$/, "©");
const registeredTrademark = new InputRule(/\(r\)$/, "®");
const oneHalf = new InputRule(/1\/2$/, "½");
const plusMinus = new InputRule(/\+\/-$/, "±");
const notEqual = new InputRule(/!=$/, "≠");
const laquo = new InputRule(/<<$/, "«");
const raquo = new InputRule(/>>$/, "»");
const multiplication = new InputRule(/\d+\s?([*x])\s?\d+$/, "×");

export default inputRules({
  rules: [
    emDash,
    ellipsis,
    leftArrow,
    rightArrow,
    copyright,
    registeredTrademark,
    oneHalf,
    plusMinus,
    notEqual,
    laquo,
    raquo,
    multiplication,
    ...smartQuotes,
    wrappingInputRule(/^\s*([-+*])\s$/, schema.nodes.bullet_list),
    wrappingInputRule(
      /^(\d+)\.\s$/,
      schema.nodes.ordered_list,
      (match) => ({ start: +match[1] }),
      (match, node) => node.childCount + node.attrs.start === +match[1]
    ),
    wrappingInputRule(
      /^\s*(\[([ |x])\])\s$/,
      schema.nodes.checklist_item,
      (match) => ({
        checked: match[match.length - 1] === "x",
      })
    ),
    wrappingInputRule(/^\s*>\s$/, schema.nodes.blockquote),
    textblockTypeInputRule(/^```$/, schema.nodes.code_block),
    textblockTypeInputRule(
      new RegExp("^(#{1,2})\\s$"),
      schema.nodes.heading,
      (match) => ({
        level: match[1].length,
      })
    ),
    nodeInputRule(/^(?:---|—-|___\s|\*\*\*\s)$/, schema.nodes.horizontal_rule),
  ],
});
