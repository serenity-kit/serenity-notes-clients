import { HeadingAttrs } from "../types";

export default function (attrs1: HeadingAttrs, attrs2: HeadingAttrs) {
  return attrs1.level === attrs2.level;
}
