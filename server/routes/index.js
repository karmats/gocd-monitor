'use strict';

import express from 'express';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    // Output html rendered by react
    res.sendFile('index.html', { root : 'server/views' });
});

module.exports = router;
