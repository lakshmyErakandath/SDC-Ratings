const Pool = require('pg').Pool
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

const getReviews = (callback) => {
  pool.query('SELECT * FROM reviews WHERE product_id = 2', (error, results) => {
    if (error) {
      callback(error, null);
    }
    callback(null, results.rows);
  });
};


module.exports = {
  getProducts,
  getReviews
}