const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'Alerts routes - implementation pending' });
});

module.exports = router;