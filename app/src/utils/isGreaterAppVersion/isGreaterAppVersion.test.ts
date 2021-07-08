import isGreaterAppVersion from "./isGreaterAppVersion";

test("isGreaterAppVersion", () => {
  expect(isGreaterAppVersion("0.0.0", "0.0.0")).toBe(false);
  expect(isGreaterAppVersion("1.0.0", "1.0.0")).toBe(false);
  expect(isGreaterAppVersion("0.1.0", "0.1.0")).toBe(false);
  expect(isGreaterAppVersion("1.0.1", "1.0.1")).toBe(false);
  expect(isGreaterAppVersion("1.0.9", "1.0.0")).toBe(true);
  expect(isGreaterAppVersion("1.22.0", "1.0.0")).toBe(true);
  expect(isGreaterAppVersion("54.22.0", "22.0.0")).toBe(true);
  expect(isGreaterAppVersion("54.22.0", "hello")).toBe(false);
  expect(isGreaterAppVersion("wow", "1.0.0")).toBe(false);
  expect(isGreaterAppVersion("1.0.0", "1.0")).toBe(false);
});
