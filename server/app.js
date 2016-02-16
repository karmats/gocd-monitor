'use strict';

import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

let routes = require('./routes/index'),
    users = require('./routes/users'),
    dev = require('./routes/dev');

let app = express();

let devMode = app.get('env') === 'development';

// view engine setup
app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// Use webpack server to serve static assets in development and express.static 
// for all other stages
if (devMode) {
  app.use('/assets/js', dev);
}
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.sendFile('error-' + err.status + '.html', { root : 'server/views' });
});

module.exports = app;
