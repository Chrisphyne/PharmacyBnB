const express = require('express');
const { authMiddleware, requirePermission } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, requirePermission('suppliers:read'), (req, res) => {
  res.json({ message: 'Suppliers routes - implementation pending' });
});

module.exports = router;