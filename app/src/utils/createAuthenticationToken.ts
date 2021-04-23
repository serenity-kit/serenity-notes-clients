const createAuthenticationToken = (device: Olm.Account) => {
  const message = new Date().toISOString();
  const deviceIdKeys = JSON.parse(device.identity_keys());
  const signature = device.sign(message);
  return `${deviceIdKeys.ed25519} ${message} ${signature}`;
};

export default createAuthenticationToken;
