'use strict';

import express from 'express';
import path from 'path';
import socketio from 'socket.io';
import { parseString } from 'xml2js';

import GoService from './services/GoService';


const routes = require('./routes/index'),
      dev = require('./routes/dev'),
      app = express(),
      io = socketio(),
      devMode = app.get('env') === 'development',
      goService = new GoService();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

// Use webpack server to serve static assets in development and express.static 
// for all other stages
if (devMode) {
  app.use('/assets/js', dev);
}
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/', routes);

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

// socket.io setup
app.io = io;

io.on('connection', (socket) => {
  console.log('connection established');
  socket.on('disconnect', () => {
    console.log('app disconnected');
  })
  goService.getAllPipelines().then((res) => {
    console.log(res);
    goService.getPipelineHistory(res[10]).then((ph) => {
      console.log(ph);
    })
  });
  setInterval(() => {
    socket.emit('pipelines:new', {pipelines : 'omfg', date: new Date()})
  }, 5000);
});

module.exports = app;
