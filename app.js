var createError = require('http-errors');
var express = require('express');
var session = require('express-session')
var path = require('path');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
var logger = require('morgan');
require('dotenv').config()
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use(session({ 
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 }
}));
app.use(cors());
mongoose.connect('mongodb+srv://data123:data123@cluster0.exouw.mongodb.net/island?retryWrites=true&w=majority')
    .then(() => console.log('MongoDB Database Connected'))
    .catch(err => console.log(err)) 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressLayouts);

app.set('layout', 'layout/backend/layout');
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(session({ 
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 }
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.role=req.session.role;
  res.locals.name=req.session.re_usr_name;
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
