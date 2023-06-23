require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
// mongodb connect
const mongoose =require ('mongoose')
// nocache to control cache.
const nocache = require("nocache");

const expressLayouts = require('express-ejs-layouts');
// session
const session=require('express-session')
// password bcrypt
const bcrypt = require('bcrypt');

// multer
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })


// const db = require('./config/connection');
// const connect = require('./config/connection');

const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('views')
app.set('layout','layouts/layout');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));
app.use(expressLayouts);
app.use(nocache());


// Connect to MongoDB using Mongoose
// mongoose.connect('mongodb://127.0.0.1:27017/ecommerce', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('Database connected2'))
//   .catch((err) => console.log('Connection error:', err));


// session handling
app.use(session({
  secret : process.env.cookieSecret,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 10, // 10 days
    // maxAge: 5000 // 10 days
  },
  resave:false
}))

app.use('/admin', adminRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
app.locals.user=''
// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  // console.log(err.message)
  res.render('error', { layout:false ,error:err , message: err.message});
});

module.exports = app;
