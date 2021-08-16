/* eslint-disable camelcase */
const { Pool } = require('pg');

const pool = new Pool({
  user: 'lakshmi',
  host: 'localhost',
  database: 'customerReviews',
  password: 'password',
  port: 5432,
});

const getProducts = (callback) => {
  pool.query('SELECT * FROM products limit 20', (error, results) => {
    if (error) {
      callback(error, null);
    }
    callback(null, results.rows);
  });
};

const getReviews = (query, callback) => {
  pool.query(`SELECT reviews.id AS review_id, reviews.rating,
  reviews.summary, reviews.recommend, reviews.response,
  reviews.body, reviews.date, reviews.reviewer_name,
  reviews.helpfulness,
  json_agg (json_build_object('id', reviews_photos.id, 'url', reviews_photos.url))
  AS photos FROM reviews LEFT JOIN reviews_photos ON reviews_photos. review_id = reviews.id
  WHERE product_id=${query.product_id} AND reviews.reported = false
  GROUP BY reviews.id`, (error, results) => {
    if (error) {
      callback(error, null);
    }
    callback(null, results.rows);
  });
};

const getReviewsMeta = (query, callback) => {
  const { product_id } = query;
  const ratingsQuery = `SELECT json_object_agg(pR.rV, pR.rC) AS result FROM
  (SELECT rating AS rV ,count(*) AS rC FROM reviews WHERE product_id=${product_id}
   GROUP BY rating) AS pR;`;

  const recommendQuery = `SELECT json_object_agg(pR.r, pR.rC) AS result FROM
   (SELECT recommend AS r,count(*) AS rC FROM reviews WHERE product_id=${product_id}
    GROUP BY recommend) AS pR;`;

  const characteristicsQuery = `SELECT json_object_agg(rC.name,rC.value) AS result FROM
  (SELECT c.name AS name, json_build_object('id' ,cr.characteristic_id,'value', AVG(cr.value))
  AS value from characteristics_reviews cr, characteristics c where cr.characteristic_id = c.id
  AND product_id = ${product_id} GROUP BY c.name,cr.characteristic_id) AS rC;`;

  const queries = ratingsQuery + recommendQuery + characteristicsQuery;
  pool.query(queries, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      const [ratings, recommended, characteristics] = results.map(((r) => r.rows[0].result));
      callback(null, {
        product_id,
        ratings,
        recommended,
        characteristics,
      });
    }
  });
};

// const getReviews = (query, callback) => {
//   if (query.sort === 'relevant') {
//     pool.query(`SELECT * FROM reviews WHERE product_id = ${query.product_id}
//   ORDER BY helpfulness DESC, date DESC`, (error, results) => {
//       if (error) {
//         callback(error, null);
//       }
//       callback(null, results.rows);
//   });
//   } if (query.sort === 'helpfulness') {
//     pool.query(`SELECT review.date, review.body, reviews_photosq.url FROM reviews, reviews_photos WHERE product_id = ${query.product_id}
//   ORDER BY ${query.sort} DESC`, (error, results) => {
//       if (error) {
//         callback(error, null);
//       }
//       callback(null, results.rows);
//   });
//   }
//   }

module.exports = {
  getProducts,
  getReviews,
  getReviewsMeta,
};