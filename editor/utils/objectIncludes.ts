// https://github.com/ueberdosis/tiptap/blob/6212cb46d12e1765bebc3b7ccd5edecf84cb56b1/packages/core/src/utilities/objectIncludes.ts

/**
 * Check if object1 includes object2
 * @param object1 Object
 * @param object2 Object
 */
export default function objectIncludes(
  object1: Record<string, any>,
  object2: Record<string, any>
): boolean {
  const keys = Object.keys(object2);

  if (!keys.length) {
    return true;
  }

  return !!keys.filter((key) => object2[key] === object1[key]).length;
}
