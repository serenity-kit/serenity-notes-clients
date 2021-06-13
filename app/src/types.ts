export type GroupSessionKeyMessage = {
  sessionId: string;
  sessionKey: string;
  messageIndex: number;
};

export type GroupSession = {
  session: any;
  prevKeyMessage: GroupSessionKeyMessage;
};

export type PickledGroupSession = {
  pickledSession: string;
  prevKeyMessage: GroupSessionKeyMessage;
};

export type DevicePublicIdentityKeys = {
  idKey: string;
  signingKey: string;
};

export type User = {
  id: string;
};

export type RepositoryCollaborator = {
  id: string;
};

export type RepositoryUpdate = {
  type: "success" | "failed";
  contentId: string;
  createdAt: string;
  authorDeviceKey: string;
};

export type Repository = {
  id: string;
  name: string;
  content: Uint8Array;
  format: "yjs-13-base64";
  serverId?: string;
  groupSession?: PickledGroupSession;
  groupSessionCreatedAt?: string;
  groupSessionMessageIds?: string[];
  collaborators?: RepositoryCollaborator[];
  isCreator?: boolean;
  updates?: RepositoryUpdate[];
  updatedAt?: string;
  lastContentUpdateIntegrityId?: string;
  notAppliedUpdatesIncludeNewerSchemaVersion?: boolean;
};

export type RepositoryStoreEntry = {
  id: string;
  name: string;
  content: string;
  format: "yjs-13-base64";
  serverId?: string;
  groupSession?: PickledGroupSession;
  groupSessionCreatedAt?: string;
  groupSessionMessageIds?: string[];
  collaborators?: RepositoryCollaborator[];
  updates?: RepositoryUpdate[];
  lastContentUpdateIntegrityId?: string;
  updatedAt?: string;
  notAppliedUpdatesIncludeNewerSchemaVersion?: boolean;
};

export type DeviceKeys = {
  idKey: string;
  signingKey: string;
};

export type OneTimeKeyWithSignature = {
  key: string;
  signature: string;
};

export type LicenseToken = {
  token: string;
  isActive: boolean;
  subscriptionPlan: string;
};

export type DebugEntryType = "info" | "error";

export type DebugEntry = {
  createdAt: string;
  content: string;
  type: DebugEntryType;
};
