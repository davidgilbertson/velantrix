// This provides the ability to stringify/parse an object in such a way that the resulting
// JSON string will be the same given the same data.
// Native JSON.stringify() doesn't support this since key order can change.

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
