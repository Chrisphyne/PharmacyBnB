const express = require('express');
const { authMiddleware, requirePermission } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, requirePermission('sales:read'), (req, res) => {
  res.json({ message: 'Sales routes - implementation pending' });
});

module.exports = router;