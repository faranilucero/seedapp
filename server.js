var express = require('express');
var port = process.env.PORT || 8080;
var mysqlPort = process.env.mysqlPort || 3000;
var session = require('express-session');
var bodyParser = require('body-parser');  
var app = express();
var db = require('./db');
var sess;

// CONNECT TO MYSQL
db.connect(db.MODE_TEST, function(err) {
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
app.use(express.static(__dirname + '/public'));
app.use('/lib/bootstrap',          express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/lib/jquery',             express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/lib/angular',            express.static(__dirname + '/node_modules/angular/'));
app.use('/lib/angular-ui-router',  express.static(__dirname + '/node_modules/angular-ui-router/release/'));

// CONFIGURE EXPRESS
app.use(session({
  secret: 'secretword',
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
  var returnValue = false;
  sess = req.session;

  if (sess.email !== undefined && req.body.email == sess.email) {
    returnValue = true;
  }

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