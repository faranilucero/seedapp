var express = require('express');
var port = process.env.PORT || 3000;
var session = require('express-session');
var bodyParser = require('body-parser');  
var app = express();

app.use(express.static(__dirname + '/public'));
app.use('/lib/bootstrap',          express.static(__dirname + '/node_modules/bootstrap/dist/'))
app.use('/lib/jquery',             express.static(__dirname + '/node_modules/jquery/dist/'))
app.use('/lib/angular',            express.static(__dirname + '/node_modules/angular/'));
app.use('/lib/angular-ui-router',  express.static(__dirname + '/node_modules/angular-ui-router/release/'));

app.use(session({
  secret: 'secretword',
  resave: false,
  saveUninitialized: false  
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var sess;

app.all('*', function (req, res, next) {
  if (req.isAuthenticated()){
    next();
  }
  else {
    res.sendFile('index.html');
  }

});

app.get('/', function(req, res) {
  sess = req.session;

  if (sess.email) {
    res.redirect('/admin');
  }
  else {
    res.sendFile('index.html');
  }
});

app.post('/login', function(req, res){
  sess = req.session;
  sess.email = req.body.email;
  res.end('done');
});

app.get('/admin', function(req, res) {
  sess = req.session;
  if (sess.email) {
    res.write('<h1>hello ' + sess.email + '</h1>');
    res.end('<a href="/logout">Logout</a>');
  }
  else {
    res.write('<h1>Please login first.</h1>');
    res.end('<a href="/">Login</a>');
  }
});

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

app.listen(port, function() {
  console.log("App started on PORT " + port);
});