const express = require('express');
const api = express.Router();
const routes = require('./v1/routes');
api.use('/v1', routes);

module.exports = api;
