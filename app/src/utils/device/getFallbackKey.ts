export default function (device: Olm.Account) {
  let fallbackKey = "";
  const deviceFallbackKeys = JSON.parse(device.fallback_key());
  for (const key in deviceFallbackKeys.curve25519) {
    fallbackKey = deviceFallbackKeys.curve25519[key];
  }
  const fallbackKeySignature = device.sign(fallbackKey);

  return { fallbackKey, fallbackKeySignature };
}
