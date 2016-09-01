var sessionMode = 'test' // test or production
  , dbMode = 'test' // test or production
  ;

var express = require('express')
  , port = process.env.PORT || 8080
  , mysqlPort = process.env.mysqlPort || 3000
  , session = require('express-session')
  , RedisStore = require('connect-redis')(session)
  , bodyParser = require('body-parser')
  , db = require('./db')
  , app = express()
  , REDIS_PRODUCTION = { host: 'ec2-54-163-236-235.compute-1.amazonaws.com', port: 17759, user: 'h', password: 'pavr1ip4ql1otca11dlp9qb8d59' }
  , REDIS_TEST = { host: 'localhost', port: 6379 }
  , redisOptions = sessionMode === 'production' ? REDIS_PRODUCTION : REDIS_TEST
  , sess
  ;

// CONNECT TO MYSQL
db.connect(dbMode, function(err) {
  if (err) {
    console.log('Unable to connect to MySQL.')
    process.exit(1);
  } else {
    app.listen(mysqlPort, function() {
      console.log('MySQL started: PORT ' + mysqlPort);
    });
  }
});

// EXPOSE DIRECTORIES TO WEBSERVER/PUBLIC
app.use(express.static(__dirname + '/../public'));
app.use('/lib/bootstrap',          express.static(__dirname + '/../node_modules/bootstrap/dist/'));
app.use('/lib/jquery',             express.static(__dirname + '/../node_modules/jquery/dist/'));
app.use('/lib/angular',            express.static(__dirname + '/../node_modules/angular/'));
app.use('/lib/angular-ui-router',  express.static(__dirname + '/../node_modules/angular-ui-router/release/'));

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
app.get('/', function(req, res) {
  res.sendFile('index.html');
});

// VALIDATE AUTHENTICATION STATUS
app.post('/isSignedIn', function(req, res) {
  sess = req.session;
  var returnValue = 
    (sess !== undefined && sess.email !== undefined && req.body.email === sess.email) ? true : false;

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ signedInStatus: returnValue }));
});

// PROCESS LOGIN REQUEST
app.post('/login', function(req, res){
  var returnStatus = 'invalid';
  sess = req.session;
  
  db.get().query('SELECT USER_ID, USER_EMAIL_ADDRESS FROM USERS WHERE ACTIVE = 1 AND LOCKED_OUT = 0 AND USER_EMAIL_ADDRESS = ?', req.body.email, 
    function (err, rows) {
      if (err) 
        console.log(err);
      else {      
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].USER_EMAIL_ADDRESS === req.body.email) {
            sess.email = rows[i].USER_EMAIL_ADDRESS;
            returnStatus = 'valid';
          }
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ status: returnStatus , email : sess.email }));
      }
    }
  );
});

// PROCESS LOGOUT REQEUST
app.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.log(err);
    }
    else {
      res.redirect('/');
    }
  });
});

// START EXPRESS WEBSERVER
app.listen(port, function() {
  console.log("Express started: PORT " + port);
});
