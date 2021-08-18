/* eslint-disable camelcase */
const { Pool } = require('pg');
const format = require('pg-format');

const pool = new Pool({
  user: 'lakshmi',
  host: 'localhost',
  database: 'customerReviews',
  password: 'password',
  port: 5432,
});

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

const postReviews = (options, callback) => {
  const insertReviews = `INSERT INTO reviews(product_id, rating, summary,
     recommend,response, body, date,reviewer_name, helpfulness)
      VALUES(${options.productId}, ${options.rating}, '${options.summary}',
         ${options.recommend}, '${options.response}', '${options.body}',
         ${options.date}, '${options.reviewerName}', ${options.helpfulness})
       RETURNING id AS review_id`;

  pool.query(insertReviews, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      const reviewId = results.rows[0].review_id;

      const photos = [];
      options.photos.forEach((item, index) => {
        photos.push([reviewId, item.url]);
      });

      const query = format('INSERT INTO reviews_photos (review_id, url) VALUES %L', photos);
      pool.query(query, (error, results) => {
        if (error) {
          callback(error, null);
        } else {
          // const reviewIds = results.rows[0].review_id;
          const characteristics = [];
          const characteristicsValue = Object.values(options.characteristics);
          characteristicsValue.forEach((item) => {
            characteristics.push([item.id, item.value, reviewId]);
          });

          const characteristicsQuery = format('INSERT INTO characteristics_reviews (characteristic_id, value,review_id) VALUES %L',
            characteristics);
          pool.query(characteristicsQuery, (error, results) => {
            if (error) {
              callback(error, null);
            } else {
              callback(null, results);
            }
          });
        }
      });
    }
  });
};

module.exports = {
  getReviews,
  getReviewsMeta,
  postReviews,
};
