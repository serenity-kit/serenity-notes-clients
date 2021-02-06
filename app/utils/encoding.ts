import base64 from "base-64";

export const uInt8ArrayToBase64 = (bytes) => {
  let s = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    s += String.fromCharCode(bytes[i]);
  }
  return base64.encode(s);
};

export const base64ToUInt8Array = (s) => {
  const a = base64.decode(s);
  const bytes = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    bytes[i] = a.charCodeAt(i);
  }
  return bytes;
};
