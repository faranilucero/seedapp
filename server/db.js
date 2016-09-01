var mysql = require('mysql');

var PRODUCTION_DB = 'heroku_1548ab8f11f528f'
  , PRODUCTION_HOST = 'us-cdbr-iron-east-04.cleardb.net'
  , PRODUCTION_USER = 'b68cc988042f98'
  , PRODUCTION_PASS = '1b999c70'
  , TEST_DB = 'base'
  , TEST_HOST = 'localhost'
  , TEST_USER = 'root'
  , TEST_PASS = 'KGBrani143$$';

var state = {
  pool: null,
  mode: null,
};

exports.connect = function(mode, done) {
  state.pool = mysql.createPool({
    host: mode === 'production' ? PRODUCTION_HOST : TEST_HOST,
    user: mode === 'production' ? PRODUCTION_USER : TEST_USER,
    password: mode === 'production' ? PRODUCTION_PASS : TEST_PASS,
    database: mode === 'production' ? PRODUCTION_DB : TEST_DB
  });

  state.mode = mode;
  done();
};

exports.get = function() {
  return state.pool;
};
