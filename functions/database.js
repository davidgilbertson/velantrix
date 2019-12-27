const functions = require('firebase-functions');
const admin = require('firebase-admin');
const uuid = require('uuid/v4');
const orderKeys = require('./orderKeys');

admin.initializeApp(functions.config().firebase);
const collection = admin.firestore().collection('all');

const prepareDataForFirebase = rawData => {
  // This copies the logic Firebase uses to assess an input's validity
  const isPlainObject =
    Object.prototype.toString.call(rawData) === '[object Object]' &&
    (Object.getPrototypeOf(rawData) === Object.prototype ||
      Object.getPrototypeOf(rawData) === null)
  ;

  return isPlainObject ? rawData : {data: rawData};
};

module.exports = {
  async create(rawData) {
    const id = uuid();

    const data = prepareDataForFirebase(rawData);

    await collection.doc(id).create(data);

    return id;
  },

  async read(id) {
    const docRef = await collection.doc(id).get();

    return docRef.exists ? orderKeys(docRef.data()) : undefined;
  },

  async update(id, rawData) {
    // Update must fail if the specified item does not already exist
    const docRef = await collection.doc(id).get();

    if (!docRef.exists) return false;

    const data = prepareDataForFirebase(rawData);
    await collection.doc(id).set(data);

    return true;
  },

  async delete(id) {
    return await collection.doc(id).delete();
  }
};
