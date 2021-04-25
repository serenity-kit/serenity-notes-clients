import SecureStore from "react-native-macos-sensitive-info";

const options = {
  keychainService: "Serenity Notes Storage",
};

export default {
  setItemAsync: async (key, value) => {
    return await SecureStore.setItem(key, value, options);
  },
  getItemAsync: async (key) => {
    return (await SecureStore.getItem(key, options)) || null;
  },
  deleteItemAsync: async (key) => {
    return SecureStore.deleteItem(key, options);
  },
};
