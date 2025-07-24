const express = require('express');
const { authMiddleware, requirePermission } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, requirePermission('orders:read'), (req, res) => {
  res.json({ message: 'Orders routes - implementation pending' });
});

module.exports = router;