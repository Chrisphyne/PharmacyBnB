const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, requireRole('ADMIN'), (req, res) => {
  res.json({ message: 'Users routes - implementation pending' });
});

module.exports = router;