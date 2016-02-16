let express = require('express');
let request = require('request');
let conf = require('../../app-config').config;
let router = express.Router();

var webpackServerUrl = 'http://localhost:' + conf.devPort;

// Proxy all requests through to the webpack server
router.get('/*', function(req, res) {
  console.log(webpackServerUrl.concat(req.baseUrl, req.url));
  request(webpackServerUrl.concat(req.baseUrl, req.url))
  .pipe(res);
});

module.exports = router;
