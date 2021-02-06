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
};

export type RepositoryListEntry = {
  id: string;
  name: string;
  serverId?: string;
  collaborators?: RepositoryCollaborator[];
  updatedAt: string;
  lastUpdatedAt: string; // TODO deprecated in favour of updatedAt
  lastContentUpdateIntegrityId?: string;
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
