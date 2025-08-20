const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Task content cannot be empty'],
    trim: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  dueDate: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
