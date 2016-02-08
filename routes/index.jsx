'use strict';

import express from 'express';
import ReactDOMServer from "react-dom/server";
import React from "react";

import Main from "../components/Main";

let router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    var reactHtml = ReactDOMServer.renderToString(<Main />);
    // Output html rendered by react
    res.render('index.ejs', {reactOutput: reactHtml});
});

module.exports = router;
