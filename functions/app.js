const express = require('express');
const cors = require('cors');
const database = require('./database');

const app = express();

const ORIGIN_WHITELIST = [
  /localhost:/,
  'https://discomundus.web.app',
  'https://scatter-bar.web.app',
  'https://sydsubmem.web.app',
  'https://talkonanon.web.app',
];

app.use(cors({origin: ORIGIN_WHITELIST}));

// All handlers return a JSON object with one of four props: error, success, id or data
app.post('/', async (req, res, next) => {
  try {
    const id = await database.create(req.body);

    res.json({id});
  } catch (err) {
    next(err);
  }
});

app.get('/:id', async (req, res, next) => {
  try {
    const data = await database.read(req.params.id);

    if (data) {
      res.json({data});
    } else {
      res.status(404).json({error: 'No item with that ID exists'});
    }
  } catch (err) {
    next(err);
  }
});

app.put('/:id', async (req, res, next) => {
  try {
    const success = await database.update(req.params.id, req.body);

    if (success) {
      // TODO (davidg): should PUT return the item just before it was updated?
      //  Pros: useful for a chat app. Cons: network usage
      res.json({success: 'Item updated'});
    } else {
      res.status(404).json({error: 'No item with that ID exists'});
    }
  } catch (err) {
    next(err);
  }
});

app.delete('/:id', async (req, res, next) => {
  try {
    await database.delete(req.params.id);

    res.json({success: 'Item deleted'});
  } catch (err) {
    next(err);
  }
});

// Four args define this as an error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({error: 'Something went wrong'});
});

module.exports = app;
