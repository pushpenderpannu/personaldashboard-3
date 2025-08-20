const mongoose = require('mongoose');

const WidgetConfigSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // A unique identifier for the widget instance on the dashboard
  instanceId: {
    type: String,
    required: true,
    unique: true,
  },
  widgetType: {
    type: String,
    required: true,
    enum: ['Calendar', 'News', 'Tweets', 'Stocks', 'TaskList', 'Weather'],
  },
  layout: {
    i: { type: String, required: true }, // instanceId
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
  },
  config: {
    type: mongoose.Schema.Types.Mixed, // For flexible widget-specific settings
    default: {},
  },
  aiPrompt: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('WidgetConfig', WidgetConfigSchema);
