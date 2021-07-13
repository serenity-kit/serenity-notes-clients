let idCounter = 0;

export default function uniqueId() {
  const id = ++idCounter + "";
  return "id" + id;
}
