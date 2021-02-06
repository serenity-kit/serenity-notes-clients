import * as Device from "expo-device";

export default function getDeviceName() {
  return Device.modelName || Device.osName;
}
