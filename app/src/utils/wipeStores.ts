import AsyncStorage from "@react-native-async-storage/async-storage";
import { deletePrivateUserSigningKey } from "./privateUserSigningKeyStore";
import { deleteDevice } from "./deviceStore";
import { deleteUser } from "../stores/userStore";
import { deleteRepositories } from "./repositoryStore";
import { deletePrivateInfo } from "./privateInfoStore";

// used to trigger subscribers where implemented
const wipeStore = async () => {
  await deleteDevice();
  await deleteUser();
  await deletePrivateUserSigningKey();
  await deleteRepositories();
  await deletePrivateInfo();
  await AsyncStorage.clear();
};

export default wipeStore;
