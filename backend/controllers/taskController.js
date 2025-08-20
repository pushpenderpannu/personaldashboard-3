const Task = require('../models/Task');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// @desc    Get all tasks for a user
// @route   GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  const { content, dueDate } = req.body;
  try {
    const task = new Task({
      user: req.user.id,
      content,
      dueDate,
    });
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const { content, isCompleted, dueDate } = req.body;
    const task = await Task.findById(req.params.id);

    if (task && task.user.toString() === req.user.id) {
      task.content = content ?? task.content;
      task.isCompleted = isCompleted ?? task.isCompleted;
      task.dueDate = dueDate ?? task.dueDate;
      const updatedTask = await task.save();
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task && task.user.toString() === req.user.id) {
      await task.deleteOne();
      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI-powered task suggestions
// @route   POST /api/tasks/ai/suggest
const getTaskSuggestions = async (req, res) => {
  const { tasks, prompt } = req.body; // Expect an array of task objects and a custom prompt

  if (!tasks || !prompt) {
    return res.status(400).json({ message: 'Tasks and a prompt are required.' });
  }

  try {
    const fullPrompt = `${prompt}\n\nHere are the current tasks:\n${tasks.map(t => `- ${t.content} (Completed: ${t.isCompleted})`).join('\n')}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ suggestion: text });
  } catch (error) {
    console.error('Error with Gemini AI:', error);
    res.status(500).json({ message: 'Failed to get AI suggestions.' });
  }
};


module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskSuggestions,
};
