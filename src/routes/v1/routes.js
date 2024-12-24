const express = require('express');
const healthRoutes = require("../../health/health");
const webhookRoutes = require('../../api/webhook/webhook');

const router = express.Router();

const defaultRoutes = [
  healthRoutes,
  webhookRoutes
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.router);
});

module.exports = router;
