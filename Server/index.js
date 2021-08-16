const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./db');
const port = 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/products', (req, res) => {
  db.getProducts((err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });

});

app.get('/reviews', (req, res) => {
  db.getReviews(req.query, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });

});

app.get('/reviews/meta', (req, res) => {
  db.getReviewsMeta(req.query, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});

app.listen(port, () => {
  console.log (`App running on port ${port}.`);
});

