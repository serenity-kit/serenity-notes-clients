import Y from "yjs";
import * as encoding from "lib0/encoding.js";
import * as decoding from "lib0/decoding.js";

const doc = new Y.Doc();
// doc.getArray("myarray").insert(0, ["Hello doc2, you got this?"]);

// const update = Y.encodeStateAsUpdate(doc);
// console.log(update);

// const x = JSON.stringify(Array.apply([], update));
// console.log(x);
// console.log(new Uint8Array(JSON.parse(x)));

// const restoredDoc = new Y.Doc();
// Y.applyUpdate(restoredDoc, update);
// console.log(restoredDoc.getArray("myarray").get(0)); // => 'Hello doc2, you got this?'

const userId = "abc";
const yContacts = doc.getMap("contacts");
const contact = yContacts.get(userId);
const newContact = contact ? contact : new Y.Map();
newContact.set("name", "Max");
yContacts.set(userId, newContact);

const yContacts2 = doc.getMap("contacts");
const contact2 = yContacts.get(userId);
console.log(contact2.get("name"));
