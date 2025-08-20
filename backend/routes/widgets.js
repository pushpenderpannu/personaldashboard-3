const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getWidgetConfigs,
  addWidgetConfig,
  updateWidgetLayouts,
  updateWidgetConfig,
  deleteWidgetConfig,
} = require('../controllers/widgetController');

// All routes here are protected
router.use(protect);

router.route('/')
  .get(getWidgetConfigs)
  .post(addWidgetConfig);

router.route('/layout').put(updateWidgetLayouts);

router.route('/:instanceId')
  .put(updateWidgetConfig)
  .delete(deleteWidgetConfig);

module.exports = router;
