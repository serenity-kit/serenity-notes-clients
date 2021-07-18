import Olm from "../olm_legacy";
import * as deviceStore from "../../stores/deviceStore";
import {
  DevicePublicIdentityKeys,
  GroupSession,
  PickledGroupSession,
  OneTimeKeyWithSignature,
} from "../../types";
import createAuthenticationToken2 from "../createAuthenticationToken";
import getFallbackKey from "./getFallbackKey";
import removeOneTimeKey from "./removeOneTimeKey";

const pickleKey = deviceStore.pickleKey;

export const initOlm = async () => {
  return await Olm.init();
};

export const createDevice = () => {
  const currentDevice = new Olm.Account();
  currentDevice.create();
  // There can be two fallback keys. Olm internally keeps track
  // of the previous one and current one. To at least have one
  // and don't accidentally create multiple it's generated on
  // device creation.
  currentDevice.generate_fallback_key();
  return currentDevice;
};

export const generateOneTimeKeys = (
  device: Olm.Account,
  oneTimeKeysAmount: number
) => {
  device.generate_one_time_keys(oneTimeKeysAmount);
  const deviceOnetimeKeys = JSON.parse(device.one_time_keys());
  const oneTimeKeys: OneTimeKeyWithSignature[] = [];
  for (const key in deviceOnetimeKeys.curve25519) {
    oneTimeKeys.push({
      key: deviceOnetimeKeys.curve25519[key],
      signature: device.sign(deviceOnetimeKeys.curve25519[key]),
    });
  }
  return oneTimeKeys;
};

export const generateOneTimeKeysAndSaveDevice = async (
  device: Olm.Account,
  oneTimeKeysAmount: number
) => {
  const oneTimeKeys = generateOneTimeKeys(device, oneTimeKeysAmount);
  // the oneTimeKeys are storred in the device and therefor it must be updated
  await deviceStore.persistDevice();
  return oneTimeKeys;
};

export const getIdentityKeys = (
  device: Olm.Account
): DevicePublicIdentityKeys => {
  const deviceIdKeys = JSON.parse(device.identity_keys());
  const idKey = deviceIdKeys.curve25519;
  const signingKey = deviceIdKeys.ed25519;
  return { idKey, signingKey };
};

export const createAddDeviceMessage = (
  currentDevice: Olm.Account,
  deviceIdKey: string,
  deviceOneTimeKey: string,
  secret: string
) => {
  // device outbound session to other device
  const session = new Olm.Session();
  session.create_outbound(currentDevice, deviceIdKey, deviceOneTimeKey);
  return session.encrypt(secret);
};

export const verifyAndExtractAddDeviceVerification = async (
  message: string,
  device: Olm.Account,
  secret: string,
  verificationCode: string
) => {
  const session = new Olm.Session();
  const encryptedMsg = JSON.parse(message);
  session.create_inbound(device, encryptedMsg.body);
  const decryptedVerificationMsg = session.decrypt(
    encryptedMsg.type,
    encryptedMsg.body
  );

  // NOTE the oneTimeKey has never been published to the OneTimeKey model on the
  // server and therefor does need to be removed on the server
  await removeOneTimeKey({
    variant: "onlyLocal",
    message: encryptedMsg.body,
    session,
    device,
  });

  const secrets = decryptedVerificationMsg.split(" ");
  if (secrets[0] !== secret || secrets[1] !== verificationCode) {
    throw new Error("Secrets failed.");
  }
  const fallbackKey = getFallbackKey(device);
  if (secrets[4] !== fallbackKey.fallbackKey) {
    throw new Error("FallbackKey does not match up.");
  }
  return { privateUserSigningKey: secrets[2], userId: secrets[3] };
};

// TODO change all imports instead of re-exporting here
export const createAuthenticationToken = createAuthenticationToken2;

export const createGroupSession = (): GroupSession => {
  // create outbound session
  const outboundGroupSession = new Olm.OutboundGroupSession();
  outboundGroupSession.create();
  return {
    session: outboundGroupSession,
    prevKeyMessage: {
      sessionId: outboundGroupSession.session_id(),
      sessionKey: outboundGroupSession.session_key(),
      messageIndex: outboundGroupSession.message_index(),
    },
  };
};

export const serializeGroupSession = (
  groupSession: GroupSession
): PickledGroupSession => {
  return {
    pickledSession: groupSession.session.pickle(pickleKey),
    prevKeyMessage: groupSession.prevKeyMessage,
  };
};

export const restoreGroupSession = (
  pickledGroupSession: PickledGroupSession
): GroupSession => {
  const outboundGroupSession = new Olm.OutboundGroupSession();
  outboundGroupSession.unpickle(pickleKey, pickledGroupSession.pickledSession);
  return {
    session: outboundGroupSession,
    prevKeyMessage: pickledGroupSession.prevKeyMessage,
  };
};

export const createGroupSessionMessage = (
  groupSessionKeyMsg: any,
  currentDevice: Olm.Account,
  targetDeviceIdKey: string,
  targetDeviceOneTimeKey: string
) => {
  // create 1 on 1 message for each of the other devices
  const jsonmsg = JSON.stringify(groupSessionKeyMsg);

  // device outbound session to other device
  const session = new Olm.Session();
  session.create_outbound(
    currentDevice,
    targetDeviceIdKey,
    targetDeviceOneTimeKey
  );
  const encryptedSessionMessage = session.encrypt(jsonmsg);
  return {
    ...encryptedSessionMessage,
    targetDeviceIdKey: targetDeviceIdKey,
  };
};

export const createRepositoryUpdate = (
  outboundGroupSession: GroupSession,
  currentDevice: Olm.Account,
  encodedYState: string,
  updatedAt: string
) => {
  // The sessionKey and message index updates after every encrypt.
  // We keep the key message content right before the encrypt so we can
  // use it to share the outboundGroupSession without encrypting again,
  // but also only the most recent one to avoid them getting access to earlier messages
  outboundGroupSession.prevKeyMessage = {
    sessionId: outboundGroupSession.session.session_id(),
    sessionKey: outboundGroupSession.session.session_key(),
    messageIndex: outboundGroupSession.session.message_index(),
  };

  // create group message
  // TODO deprecate and switch to JSON object once every version <1.3.0 is unused
  // const encryptedGroupMessage = outboundGroupSession.session.encrypt(
  //   JSON.stringify({ content: encodedYState, updatedAt })
  // );
  const encryptedGroupMessage =
    outboundGroupSession.session.encrypt(encodedYState);

  const signature = currentDevice.sign(encryptedGroupMessage);
  const deviceIdKeys = JSON.parse(currentDevice.identity_keys());

  const packet = {
    senderIdKey: deviceIdKeys.curve25519,
    senderSigningKey: deviceIdKeys.ed25519,
    sessionId: outboundGroupSession.session.session_id(),
    body: encryptedGroupMessage,
    signature: signature,
    updatedAt,
  };

  return JSON.stringify(packet);
};

export const createContactInfoMessage = (
  currentDevice: Olm.Account,
  deviceIdKey: string,
  deviceOnetimeKey: string,
  clientSecret: string,
  userId: string,
  userSigningKey: string
) => {
  // device outbound session to other device
  const session = new Olm.Session();
  session.create_outbound(currentDevice, deviceIdKey, deviceOnetimeKey);
  return {
    deviceIdKey,
    encryptedMessage: session.encrypt(
      JSON.stringify({
        clientSecret,
        userId,
        userSigningKey,
      })
    ),
  };
};

export const decryptContactInfoMessage = async (
  message: any,
  device: Olm.Account
) => {
  const session = new Olm.Session();
  session.create_inbound(device, message.body);
  const contactInfo = session.decrypt(message.type, message.body);
  // TODO verify that this oneTimeKey only has be removed locally
  await removeOneTimeKey({
    variant: "onlyLocal",
    message: message.body,
    session,
    device,
  });
  return JSON.parse(contactInfo);
};
