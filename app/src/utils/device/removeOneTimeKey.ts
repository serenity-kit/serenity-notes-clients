import * as deviceStore from "../../stores/deviceStore";
import extractOneTimeKeyFromMessage from "./extractOneTimeKeyFromMessage";
import getFallbackKey from "./getFallbackKey";
import removeOneTimeKeyFromServer from "../server/removeOneTimeKey";

type LocalAndRemote = {
  variant: "localAndRemote";
  message: string;
  session: Olm.Session;
  device: Olm.Account;
  client: any;
};

type LocalOnly = {
  variant: "onlyLocal";
  message: string;
  session: Olm.Session;
  device: Olm.Account;
};

type Params = LocalAndRemote | LocalOnly;

export default async function removeOneTimeKey(params: Params) {
  const { device, message, session } = params;
  const oneTimeKey = extractOneTimeKeyFromMessage(message);
  const fallbackKey = getFallbackKey(device);

  // In case the actually is a fallbackKey return right away instead of removing it.
  if (oneTimeKey === fallbackKey.fallbackKey) {
    return;
  }

  device.remove_one_time_keys(session);
  // the oneTimeKeys are storred in the device and therefor it must be updated
  await deviceStore.persistDevice();

  if (params.variant === "onlyLocal") {
    return;
  } else {
    await removeOneTimeKeyFromServer(params.client, device, oneTimeKey);
  }
}
