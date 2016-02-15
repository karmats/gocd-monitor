'use strict';

import express from 'express';

let router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('{user : name : "Mats"}');
});

module.exports = router;
