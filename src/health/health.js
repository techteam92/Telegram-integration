const express = require('express');
const router = express.Router();

async function healthCheck() {
  return {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
  };
}

const serverHealth = async (req, res) => {
  const health = await healthCheck();
  res.status(200).json(health);
};

router.get('/', serverHealth);

const healthRoutes = {
  path: '/health',
  router,
};

module.exports = healthRoutes;
