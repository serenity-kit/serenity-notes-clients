export default function extractOneTimeKeyFromMessage(
  oneTimeKeyMessage: string
) {
  return oneTimeKeyMessage.slice(4, 47);
}
