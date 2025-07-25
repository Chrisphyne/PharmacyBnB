const express = require('express');
const { authMiddleware, requirePermission } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, requirePermission('reports:read'), (req, res) => {
  res.json({ message: 'Analytics routes - implementation pending' });
});

module.exports = router;