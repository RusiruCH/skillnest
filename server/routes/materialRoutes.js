const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getTopicMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require('../controllers/materialController');

const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Nested under /api/topics/:topicId/materials
router.get('/', getTopicMaterials);
router.post(
  '/',
  protect,
  requireRoles('instructor', 'admin'),
  upload.single('file'),
  createMaterial
);

// Direct material operations under /api/materials
router.get('/:id', getMaterialById);
router.put(
  '/:id',
  protect,
  requireRoles('instructor', 'admin'),
  upload.single('file'),
  updateMaterial
);
router.delete('/:id', protect, requireRoles('instructor', 'admin'), deleteMaterial);

module.exports = router;

