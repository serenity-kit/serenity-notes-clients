import { stringToBase64 } from "./base64";

test("stringToBase64", () => {
  expect(stringToBase64("abc")).toMatchSnapshot();
});
