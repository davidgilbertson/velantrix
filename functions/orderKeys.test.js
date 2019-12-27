const assert = require('assert');
const orderKeys = require('./orderKeys');

const test = (name, func) => {
  try {
    func();
  } catch (err) {
    console.error(name, err);
  }
};

const orderedStringify = object => JSON.stringify(orderKeys(object));
const orderedParse = string => orderKeys(JSON.parse(string));

test('The reason this exists', () => {
  const data1 = {
    key1: 'key one',
    key2: 'key two',
  };

  const data2 = {
    key2: 'key two',
    key1: 'key one',
  };

  assert.deepStrictEqual(
    data1,
    data2,
    'Objects contain the same data'
  );

  assert.notStrictEqual(
    JSON.stringify(data1),
    JSON.stringify(data2),
    'JSON.stringify does not assert that two objects have the same data'
  );

  assert.strictEqual(
    orderedStringify(data1),
    orderedStringify(data2),
    'orderedStringify is better'
  );
});

test('Should handle an empty array', () => {
  const data1 = [];
  const data2 = [];

  assert.strictEqual(
    orderedStringify(data1),
    orderedStringify(data2)
  );
});

test('Should handle an object in an array', () => {
  const data1 = [
    {
      key1: 'key one',
      key2: 'key two',
    }
  ];
  const data2 = [
    {
      key2: 'key two',
      key1: 'key one',
    }
  ];

  assert.strictEqual(
    orderedStringify(data1),
    orderedStringify(data2)
  );
});

test('Should handle non-objects in an array', () => {
  const data1 = [
    {
      key1: 'key one',
      key2: 'key two',
    },
    'cake',
    77,
    true,
    null,
  ];

  const data2 = [
    {
      key2: 'key two',
      key1: 'key one',
    },
    'cake',
    77,
    true,
    null,
  ];

  assert.strictEqual(
    orderedStringify(data1),
    orderedStringify(data2)
  );
});

test('Should fail on different array order', () => {
  const data1 = [
    'steak',
    'cake',
  ];

  const data2 = [
    'cake',
    'steak',
  ];

  assert.notStrictEqual(
    orderedStringify(data1),
    orderedStringify(data2)
  );
});

test('Should handle nested objects', () => {
  const data1 = [
    {
      key1: 'key one',
      key2: 'key two',
      next: {
        array: [
          {
            another: 'level',
            key2: 'key two',
            key1: 'key one',
            arr: [
              {
                num: 777,
                bool: true,
                nothing: null,
                nothingAtAll: undefined,
              },
              null,
            ]
          },
          {
            another: 'item',
          },
        ],
        object: {
          key3: 'key three',
          key4: 'key four',
        },
      },
    },
    'cake',
    {
      oneMore: {
        object: {
          key5: 'key five',
          key6: 'key six',
        },
      },
    },
  ];

  const data2 = [
    {
      key2: 'key two',
      key1: 'key one',
      next: {
        array: [
          {
            key1: 'key one',
            key2: 'key two',
            another: 'level',
            arr: [
              {
                nothingAtAll: undefined,
                nothing: null,
                bool: true,
                num: 777,
              },
              null,
            ]
          },
          {
            another: 'item',
          },
        ],
        object: {
          key4: 'key four',
          key3: 'key three',
        },
      },
    },
    'cake',
    {
      oneMore: {
        object: {
          key6: 'key six',
          key5: 'key five',
        },
      },
    },
  ];

  // orderedStringify version works nicely
  assert.strictEqual(
    orderedStringify(data1),
    orderedStringify(data2)
  );

  // JSON.stringify won't match
  const JSONData1 = JSON.stringify(data1);
  const JSONData2 = JSON.stringify(data2);
  assert.notStrictEqual(
    JSONData1,
    JSONData2
  );

  // orderedParse these though...
  const parsed1 = orderedParse(JSONData1);
  const parsed2 = orderedParse(JSONData2);

  // Now parsed 1 and 2 should have the same order keys, and plain JSON.stringify should be equal
  assert.strictEqual(
    JSON.stringify(parsed1),
    JSON.stringify(parsed2)
  );
});

test('Should handle all sorts of stuff', () => {
  const date1 = new Date();
  const date2 = new Date('2007-2-2');
  const data1 = {
    key1: date1,
    reggie: /atest/,
    key2: date2,
  };

  const data2 = {
    key2: date2,
    key1: date1,
    reggie: /atest/,
  };

  assert.strictEqual(
    orderedStringify(data1),
    orderedStringify(data2)
  );
});

test('the ordered versions behave the same as JSON', () => {
  [
    null,
    undefined,
    7,
    'cats',
    false,
    new Date(),
  ].forEach(testInput => {
    assert.strictEqual(
      orderedStringify(testInput), // my version
      JSON.stringify(testInput) // normal version
    );
  });
  // assert.strictEqual(
  //   orderedStringify(null),
  //   JSON.stringify(null)
  // );
  // assert.strictEqual(
  //   orderedStringify(),
  //   JSON.stringify()
  // );
  // assert.strictEqual(
  //   orderedStringify(undefined),
  //   JSON.stringify(undefined)
  // );
  // assert.strictEqual(
  //   orderedStringify(7),
  //   JSON.stringify(7)
  // );
  // assert.strictEqual(
  //   orderedStringify('cats'),
  //   JSON.stringify('cats')
  // );
  // assert.strictEqual(
  //   orderedStringify(false),
  //   JSON.stringify(false)
  // );
  //
  // const date = new Date();
  // assert.strictEqual(
  //   orderedStringify(date),
  //   JSON.stringify(date)
  // );
});
