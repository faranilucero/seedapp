var mysql = require('mysql');

var PRODUCTION_DB = 'heroku_b1f1d0fb3f37e39'
  , PRODUCTION_HOST = 'us-cdbr-iron-east-04.cleardb.net'
  , PRODUCTION_USER = 'be6de26286d91a'
  , PRODUCTION_PASS = '969ebf8e'
  , TEST_DB = 'base'
  , TEST_HOST = 'localhost'
  , TEST_USER = 'root'
  , TEST_PASS = 'KGBrani143$$';

exports.MODE_TEST = 'mode_test';
exports.MODE_PRODUCTION = 'mode_production';

var state = {
  pool: null,
  mode: null,
};

exports.connect = function(mode, done) {
  state.pool = mysql.createPool({
    host: mode === exports.MODE_PRODUCTION ? PRODUCTION_HOST : TEST_HOST,
    user: mode === exports.MODE_PRODUCTION ? PRODUCTION_USER : TEST_USER,
    password: mode === exports.MODE_PRODUCTION ? PRODUCTION_PASS : TEST_PASS,
    database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB
  });

  state.mode = mode;
  done();
};

exports.get = function() {
  return state.pool;
};
