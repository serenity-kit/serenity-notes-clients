export default function isGreaterAppVersion(a: string, b: string) {
  const aSplitted = a.split(".");
  const bSplitted = b.split(".");
  const aMajor = parseInt(aSplitted[0], 10);
  const bMajor = parseInt(bSplitted[0], 10);
  const aMinor = parseInt(aSplitted[1], 10);
  const bMinor = parseInt(bSplitted[1], 10);
  const aPatch = parseInt(aSplitted[2], 10);
  const bPatch = parseInt(bSplitted[2], 10);

  if (
    !Number.isInteger(aMajor) ||
    !Number.isInteger(bMajor) ||
    !Number.isInteger(aMinor) ||
    !Number.isInteger(bMinor) ||
    !Number.isInteger(aPatch) ||
    !Number.isInteger(bPatch)
  ) {
    return false;
  }

  if (
    aMajor > bMajor ||
    (aMajor === bMajor && aMinor > bMinor) ||
    (aMajor === bMajor && aMinor === bMinor && aPatch > bPatch)
  ) {
    return true;
  }

  return false;
}
