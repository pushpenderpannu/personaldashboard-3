const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskSuggestions,
} = require('../controllers/taskController');

// All routes here are protected
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

// AI-powered route
router.post('/ai/suggest', getTaskSuggestions);

module.exports = router;
