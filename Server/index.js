const newrelic = require('newrelic');
const express = require('express');
const bodyParser = require('body-parser');


const app = express();
const db = require('./db');

const port = 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' });
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

app.post('/reviews', (req, res) => {
  let options = {
    productId: req.query.product_id,
    rating: req.body.rating,
    summary: req.body.summary,
    recommend: req.body.recommend,
    response: req.body.response,
    body: req.body.body,
    date: req.body.date,
    reviewerName: req.body.reviewer_name,
    helpfulness: req.body.helpfulness,
    photos: req.body.photos,
    characteristics:req.body.characteristics,
  };
  db.postReviews(options, (err, result) => {
    if (err) {
      console.log(err);
      throw err;
    }
    res.sendStatus(201);
  });
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
