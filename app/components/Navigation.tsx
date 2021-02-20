import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon, ThemeProvider } from "react-native-elements";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import HomeScreen from "./screens/HomeScreen";
import NoteScreen from "./screens/NoteScreen";
import SettingsScreen from "./screens/SettingsScreen";
import ContactsScreen from "./screens/ContactsScreen";
import ContactScreen from "./screens/ContactScreen";
import DeviceScreen from "./screens/DeviceScreen";
import ContactInvitationScreen from "./screens/ContactInvitationScreen";
import AddDeviceToExistingUserScreen from "./screens/AddDeviceToExistingUserScreen";
import VerifyAddDeviceToExistingUserScreen from "./screens/VerifyAddDeviceToExistingUserScreen";
import AddCollaboratorToNoteScreen from "./screens/AddCollaboratorToNoteScreen";
import CreateContactInvitationScreen from "./screens/CreateContactInvitationScreen";
import AcceptContactInvitationScreen from "./screens/AcceptContactInvitationScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import NoteSettingsScreen from "./screens/NoteSettingsScreen";
import NoteCollaboratorScreen from "./screens/NoteCollaboratorScreen";
import AddLicenseTokenScreen from "./screens/AddLicenseTokenScreen";
import useSync from "../hooks/useSync";
import { UtilsProvider } from "../context/UtilsContext";
import useDevice from "../hooks/useDevice";
import useUser from "../hooks/useUser";
import fetchAllLicenseTokens from "../utils/server/fetchAllLicenseTokens";
import { useClient } from "urql";
import colors from "../styles/colors";

const RootStack = createStackNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const theme = {
  colors: {
    primary: "black",
  },
};

const nativePaperTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "black",
    accent: "#ccc",
  },
};

const headerOptions = {
  headerTintColor: "black",
  headerStyle: {
    backgroundColor: colors.background,
    shadowColor: "transparent",
    elevation: 0,
  },
};

function Notes() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen
        name="Notes"
        component={HomeScreen}
        options={{ headerLeft: null }}
      />
      <Stack.Screen name="Note" component={NoteScreen} />
      <Stack.Screen
        name="AddCollaboratorToNote"
        component={AddCollaboratorToNoteScreen}
        options={{ title: "Add Collaborator to Note" }}
      />
      <Stack.Screen
        name="NoteSettings"
        component={NoteSettingsScreen}
        options={{ title: "Note Settings" }}
      />
      <Stack.Screen
        name="NoteCollaborator"
        component={NoteCollaboratorScreen}
        options={{ title: "Note Collaborator" }}
      />
    </Stack.Navigator>
  );
}

function Settings() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerLeft: null }}
      />
      <Stack.Screen
        name="VerifyAddDeviceToExistingUserScreen"
        component={VerifyAddDeviceToExistingUserScreen}
        options={{ title: "Verify new Device" }}
      />
      <Stack.Screen
        name="AddLicenseTokenScreen"
        component={AddLicenseTokenScreen}
        options={{ title: "Add License Key" }}
      />
      <Stack.Screen
        name="DeviceScreen"
        component={DeviceScreen}
        options={{ title: "Device" }}
      />
    </Stack.Navigator>
  );
}

function Contacts() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen
        name="ContactsList"
        component={ContactsScreen}
        options={{ headerLeft: null, title: "Contacts" }}
      />
      <Stack.Screen
        name="Contact"
        component={ContactScreen}
        options={{ title: "Contact" }}
      />
      <Stack.Screen
        name="ContactInvitation"
        component={ContactInvitationScreen}
        options={{ title: "Contact Invitation" }}
      />
      <Stack.Screen
        name="AcceptContactInvitationScreen"
        component={AcceptContactInvitationScreen}
        options={{ title: "Accept Contact Invitation" }}
      />
      <Stack.Screen
        name="CreateContactInvitationScreen"
        component={CreateContactInvitationScreen}
        options={{ title: "Create Contact Invitation" }}
      />
    </Stack.Navigator>
  );
}

function MainApp() {
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: "black",
        style: {
          // // https://ethercreative.github.io/react-native-shadow-generator/
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,

          elevation: 2,
        },
      }}
    >
      <Stack.Screen
        name="Notes"
        component={Notes}
        options={{
          tabBarLabel: "Notes",
          tabBarIcon: ({ color, size }) => (
            <Icon name="edit" type="feather" color={color} size={size} />
          ),
        }}
      />
      <Stack.Screen
        name="Contacts"
        component={Contacts}
        options={{
          tabBarLabel: "Contacts",
          tabBarIcon: ({ color, size }) => (
            <Icon name="users" type="feather" color={color} size={size} />
          ),
        }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" type="feather" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const deviceResult = useDevice();
  const userResult = useUser();
  const { encryptAndUploadAllRepositories } = useSync();
  const client = useClient();

  // fetch the licenseTokens once the app loads
  React.useEffect(() => {
    if (userResult.type === "user" && deviceResult.type === "device") {
      try {
        fetchAllLicenseTokens(client, deviceResult.device);
      } catch (err) {
        console.log("Failed to fetchAllLicenseTokens");
      }
    }
  }, [deviceResult.type, userResult.type]);

  // TODO should not be the case anymore that deviceResult.type can be loading since the deviceStore refactoring with initDevice
  if (deviceResult.type === "loading" || userResult.type === "loading")
    return null;

  return (
    <UtilsProvider value={{ encryptAndUploadAllRepositories }}>
      <PaperProvider theme={nativePaperTheme}>
        <ThemeProvider theme={theme}>
          <NavigationContainer>
            <RootStack.Navigator
              screenOptions={headerOptions}
              initialRouteName={
                deviceResult.type === "device" && userResult.type === "user"
                  ? "MainApp"
                  : "Welcome"
              }
            >
              <RootStack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="AddDeviceToExistingUserScreen"
                component={AddDeviceToExistingUserScreen}
                options={{ title: "Link new Device" }}
              />
              <RootStack.Screen
                name="MainApp"
                component={MainApp}
                options={{ headerShown: false }}
              />
            </RootStack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </PaperProvider>
    </UtilsProvider>
  );
}
