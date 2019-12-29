// This orders the keys of an object, so that JSON.stringify will return
// the same string for any two deeply equal objects.
// This handles the issue of Firebase's random key order which
// would otherwise result in non-matching strings
const orderKeys = object => {
  if (Array.isArray(object)) return object.map(orderKeys);

  if (typeof object === 'object') {
    if (object === null) return object;
    if (object instanceof Date) return object;
    if (object instanceof RegExp) return object;

    const orderedObject = {};

    Object.keys(object).sort().forEach(key => {
      orderedObject[key] = orderKeys(object[key]);
    });

    return orderedObject;
  }

  return object;
};

module.exports = orderKeys;
