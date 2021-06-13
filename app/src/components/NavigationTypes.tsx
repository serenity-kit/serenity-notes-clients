import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

export type NoteStackParamsList = {
  Notes: undefined;
  Note: {
    id: string;
    isNew: boolean;
  };
  AddCollaboratorToNote: { repositoryId: string };
  NoteSettings: { id: string };
  NoteCollaborator: { repositoryId: string; collaboratorId: string };
};

export type NoteStackProps<T extends keyof NoteStackParamsList> = {
  navigation: StackNavigationProp<NoteStackParamsList, T>;
  route: RouteProp<NoteStackParamsList, T>;
};
