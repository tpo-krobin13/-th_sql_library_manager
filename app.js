var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var bookRouter = require('./routes/books');

const Sequelize = require('sequelize');
const  db  = require('./models/index');

(async () => {
  try{
    await db.sequelize.authenticate();
    console.log('Connection to the database successful!');
    await db.sequelize.sync({force: false});
  } catch(err) {
    console.log('error loading db: ' + err.message)
  }
}) ();


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//set up server to deliver static files
app.use(express.static('public'))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/books', bookRouter);

/* GET home route */
app.get('/', async function(req, res, next) {
  res.redirect('/books');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let error = new Error('That page can not be found');
  error.status = 404;
  error.message = 'We were unable to find the requested page: ' + req.url;
  throw(error);
});

// error handler
app.use(function(err, req, res, next) {
  // render the error page
  if(!err.status || !err.message){
    err.status = 500;
    err.message = 'Internal Server Error';
  }

  console.log('---------------- logging Global Error: ' + err.status, err.message, err.stack)
  res.status(err.status || 500);
  if(res.statusCode == '404'){
    res.render('page-not-found', {title: "404 Page Not Found", error: err});
  } else {
    res.render('errors', {title: "Server Error", error: err});
  }
});

module.exports = app;
