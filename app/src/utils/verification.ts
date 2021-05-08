import {
  uInt8ArrayToBase64,
  base64ToUInt8Array,
  stringToBase64,
  base64ToString,
} from "./base64";

export const generateVerificationCode = () => {
  const byteArray = new Uint8Array(6);
  crypto.getRandomValues(byteArray);
  return byteArray.join("").slice(0, 6);
};

export const generateSecret = () => {
  const byteArray = new Uint8Array(32);
  crypto.getRandomValues(byteArray);
  return uInt8ArrayToBase64(byteArray);
};

const secretToKey = async (base64Key: string) => {
  return await crypto.subtle.importKey(
    "raw",
    base64ToUInt8Array(base64Key),
    "AES-CBC",
    false,
    ["encrypt", "decrypt"]
  );
};

const generateKey = async () => {
  return await crypto.subtle.generateKey(
    { name: "AES-CBC", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

export const encrypt = async (value: string) => {
  const key = await generateKey();
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encryptedValue = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    base64ToUInt8Array(stringToBase64(value))
  );
  const rawKey = await crypto.subtle.exportKey("raw", key);
  const base64Key = uInt8ArrayToBase64(new Uint8Array(rawKey));
  const verificationCodePart1 = base64Key.substring(0, 4);
  const verificationCodePart2 = base64Key.substring(4);
  const encryptedMessage = JSON.stringify({
    iv: uInt8ArrayToBase64(iv),
    encryptedValue: uInt8ArrayToBase64(new Uint8Array(encryptedValue)),
    verificationCodePart2,
  });
  return { encryptedMessage, verificationCodePart1 };
};

export const decrypt = async (
  encryptedMessage: string,
  verificationCodePart1: string
) => {
  const data: {
    iv: string;
    encryptedValue: string;
    verificationCodePart2: string;
  } = JSON.parse(encryptedMessage);
  const key = await secretToKey(
    verificationCodePart1 + data.verificationCodePart2
  );
  const result = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: base64ToUInt8Array(data.iv) },
    key,
    base64ToUInt8Array(data.encryptedValue).buffer
  );
  return base64ToString(uInt8ArrayToBase64(new Uint8Array(result)));
};
