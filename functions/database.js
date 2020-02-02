const functions = require('firebase-functions');
const admin = require('firebase-admin');
const uuid = require('uuid/v4');
const lodashGet = require('lodash/get');
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

  /**
   * Updates an item in an array, matching on `id`, replacing the old item.
   * Creates a new array item if none exists
   *
   * @param {string|number} id - the ID of the document (NOT of the item to update)
   * @param {string} path - a path, in Lodash get() syntax
   * @param {{id: *}} data - the new item
   * @return {Promise<boolean>}
   */
  async arrayUpsert({id, path, data: newItem}) {
    const docRef = await collection.doc(id).get();

    // Update must fail if the specified item does not already exist
    if (!docRef.exists) return false;

    const array = lodashGet(docRef.data(), path);

    if (!Array.isArray(array)) {
      console.error('array:', array);
      throw Error(`The value at ${path} is not an array`)
    }

    let itemExists = false;
    const nextArray = array.map(existingItem => {
      if (existingItem.id === newItem.id) {
        itemExists = true;
        return newItem;
      }

      return existingItem;
    });

    if (!itemExists) nextArray.push(newItem);

    await collection.doc(id).update({
      [path]: nextArray,
    });

    return true;
  },

  async delete(id) {
    return await collection.doc(id).delete();
  }
};
