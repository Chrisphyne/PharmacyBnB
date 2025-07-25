const express = require('express');
const { authMiddleware, requirePermission } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, requirePermission('products:read'), (req, res) => {
  res.json({ message: 'Products routes - implementation pending' });
});

module.exports = router;