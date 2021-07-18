import AsyncStorage from "@react-native-async-storage/async-storage";
import { deletePrivateUserSigningKey } from "../stores/privateUserSigningKeyStore";
import { deleteDevice } from "../stores/deviceStore";
import { deleteUser } from "../stores/userStore";
import { deleteRepositories } from "../stores/repositoryStore";
import { deletePrivateInfo } from "../stores/privateInfoStore";

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
