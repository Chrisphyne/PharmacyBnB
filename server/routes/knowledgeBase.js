const express = require('express');
const { authMiddleware, requirePermission } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, requirePermission('knowledge:read'), (req, res) => {
  res.json({ message: 'Knowledge Base routes - implementation pending' });
});

module.exports = router;