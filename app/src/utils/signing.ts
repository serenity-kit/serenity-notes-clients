import Olm from "./olm_legacy";
import { uInt8ArrayToBase64, base64ToUInt8Array } from "./base64";
import { DevicePublicIdentityKeys } from "../types";

export const generateSigningPrivateKey = () => {
  const signing = new Olm.PkSigning();
  const privateKey = signing.generate_seed();
  return uInt8ArrayToBase64(privateKey);
};

export const generateSigningPublicKey = (privateKey: string) => {
  const seed = base64ToUInt8Array(privateKey);
  const signing = new Olm.PkSigning();
  const publicKey = signing.init_with_seed(seed);
  return publicKey;
};

export const signDevice = (
  deviceKeys: DevicePublicIdentityKeys,
  userSigningPrivateKey: string
) => {
  deviceKeys.idKey;
  deviceKeys.signingKey;

  const seed = base64ToUInt8Array(userSigningPrivateKey);
  const signing = new Olm.PkSigning();
  signing.init_with_seed(seed);
  const userSigningPublicKey = generateSigningPublicKey(userSigningPrivateKey);
  const message = `${userSigningPublicKey} ${deviceKeys.signingKey} ${deviceKeys.idKey}`;
  const signature = signing.sign(message);
  return JSON.stringify({
    version: 1,
    message,
    signature,
  });
};

export const verifyDevice = (
  deviceInfo: {
    idKey: string;
    signingKey: string;
    signatures: string[];
  },
  userSigningKey: string
) => {
  // currently we only verify one signature, later this should expand to multiple
  const signatureContent = JSON.parse(deviceInfo.signatures[0]);
  if (signatureContent.version !== 1) return false;
  const keys = signatureContent.message.split(" ");
  if (keys[0] !== userSigningKey) return false;
  if (keys[1] !== deviceInfo.signingKey) return false;
  if (keys[2] !== deviceInfo.idKey) return false;

  const olmUtil = new Olm.Utility();
  try {
    olmUtil.ed25519_verify(
      userSigningKey,
      signatureContent.message,
      signatureContent.signature
    );
    return true;
  } catch (err) {
    return false;
  }
};

export const verifyOneTimeKey = (
  deviceSigningKey: string,
  key: string,
  signature: string
) => {
  const olmUtil = new Olm.Utility();
  try {
    olmUtil.ed25519_verify(deviceSigningKey, key, signature);
    return true;
  } catch (err) {
    return false;
  }
};

export const signContactUserKey = (
  signingPrivateKey: string,
  contactUserSigningKey: string
) => {
  const seed = base64ToUInt8Array(signingPrivateKey);
  const signing = new Olm.PkSigning();
  signing.init_with_seed(seed);
  const myUserSigningKey = generateSigningPublicKey(signingPrivateKey);
  const message = `${myUserSigningKey} ${contactUserSigningKey}`;
  const signature = signing.sign(message);
  return JSON.stringify({
    version: 1,
    message,
    signature,
  });
};
