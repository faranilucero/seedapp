var sessionMode = 'production' // test or production
  , dbMode = 'production' // test or production
  ;

var express = require('express')
  , port = process.env.PORT || 8080
  , mysqlPort = process.env.mysqlPort || 3000
  , session = require('express-session')
  , RedisStore = require('connect-redis')(session)
  , bodyParser = require('body-parser')
  , db = require('./db')
  , node_crypto = require('./node_crypto')
  , app = express()
  , REDIS_PRODUCTION = { host: 'ec2-54-163-236-235.compute-1.amazonaws.com', port: 17759, user: 'h', password: 'pavr1ip4ql1otca11dlp9qb8d59' }
  , REDIS_TEST = { host: 'localhost', port: 6379 }
  , redisOptions = sessionMode === 'production' ? REDIS_PRODUCTION : REDIS_TEST
  , sess
  ;


// CONNECT TO MYSQL
db.connect(dbMode, (err) => {
  if (err) {
    console.log('Unable to connect to MySQL.')
    process.exit(1);
  } else {
    app.listen(mysqlPort, () => console.log('MySQL started: PORT ' + mysqlPort));
  }
});

// EXPOSE DIRECTORIES TO WEBSERVER/PUBLIC
app.use(express.static(__dirname + '/../public'));
app.use('/lib/bootstrap', express.static(__dirname + '/../node_modules/bootstrap/dist/'));
app.use('/lib/jquery', express.static(__dirname + '/../node_modules/jquery/dist/'));
app.use('/lib/angular', express.static(__dirname + '/../node_modules/angular/'));
app.use('/lib/angular-ui-router', express.static(__dirname + '/../node_modules/angular-ui-router/release/'));
app.use('/lib/font-awesome', express.static(__dirname + '/../node_modules/font-awesome/'));
app.use('/css', express.static(__dirname + '/../public/css/'));
app.use('/js', express.static(__dirname + '/../public/js/'));

// CONFIGURE EXPRESS SESSIONS
app.use(session({
    store: new RedisStore(redisOptions),
    secret: 'secret-word',
    resave: false,
    saveUninitialized: false  
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// SETUP ENDPOINTS
app.get('/', (req, res) => res.sendFile('index.html'));

// VALIDATE AUTHENTICATION STATUS
app.post('/isSignedIn', (req, res) => {
  sess = req.session;
  var returnValue = (sess !== undefined && sess.email !== undefined && req.body.email === sess.email) ? true : false;
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ signedInStatus: returnValue }));
});

// PROCESS LOGIN REQUEST
app.post('/login', (req, res) => {  
  var emailSubmit = req.body.email;
  var passwordSubmit = req.body.pass;

  if (req.session == undefined) {
    console.log('Unable to connect to Redis server.');  
  }

  db.get().query('SELECT USER_ID, USER_EMAIL_ADDRESS FROM USERS WHERE USER_EMAIL_ADDRESS = ? AND ACTIVE = 1 AND LOCKED_OUT = 0 LIMIT 0,1', [emailSubmit], (err, result) => {
    if (err) console.log(err);
    else if (result.length == 0) {
      return res.redirect('/#!/login?status=invalid');
    } else if (result.length > 0 && result[0].USER_EMAIL_ADDRESS === emailSubmit) {            
      db.get().query('SELECT USER_PASSWORD_HASH FROM USER_PASSWORDS UP INNER JOIN USERS U ON UP.USER_ID = U.USER_ID WHERE USER_EMAIL_ADDRESS = ? ORDER BY TIME_STAMP DESC LIMIT 0,1', [result[0].USER_EMAIL_ADDRESS], (err, passwordResult) => {
        if (err) console.log(err);
        else {      
          node_crypto.verifyPassword(passwordSubmit, passwordResult[0].USER_PASSWORD_HASH, (err, verifyResult) => {
            if (verifyResult) {
              req.session.email = emailSubmit;
              return res.redirect('/#!/forms');
            } else {
              return res.redirect('/#!/login?status=invalid');
            }
          });
        }
      });
    }
  });
});

// PROCESS LOGOUT REQEUST
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    else res.redirect('/');
  });
});

// START EXPRESS WEBSERVER
app.listen(port, function() {
  console.log("Express started: PORT " + port);
});
