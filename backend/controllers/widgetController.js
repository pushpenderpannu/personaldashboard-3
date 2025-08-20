const WidgetConfig = require('../models/WidgetConfig');

// @desc    Get all widget configurations for a user
// @route   GET /api/widgets
const getWidgetConfigs = async (req, res) => {
  try {
    const configs = await WidgetConfig.find({ user: req.user.id });
    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new widget configuration
// @route   POST /api/widgets
const addWidgetConfig = async (req, res) => {
  const { instanceId, widgetType, layout, config, aiPrompt } = req.body;
  try {
    const newConfig = new WidgetConfig({
      user: req.user.id,
      instanceId,
      widgetType,
      layout,
      config,
      aiPrompt,
    });
    const savedConfig = await newConfig.save();
    res.status(201).json(savedConfig);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update the layout of all widgets
// @route   PUT /api/widgets/layout
const updateWidgetLayouts = async (req, res) => {
  const layouts = req.body; // Expects an array of layout objects
  try {
    const bulkOps = layouts.map(l => ({
      updateOne: {
        filter: { user: req.user.id, instanceId: l.i },
        update: { $set: { layout: { i: l.i, x: l.x, y: l.y, w: l.w, h: l.h } } },
      },
    }));
    await WidgetConfig.bulkWrite(bulkOps);
    res.json({ message: 'Layouts updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Update a specific widget's configuration
// @route   PUT /api/widgets/:instanceId
const updateWidgetConfig = async (req, res) => {
  try {
    const { config, aiPrompt } = req.body;
    const updatedConfig = await WidgetConfig.findOneAndUpdate(
      { user: req.user.id, instanceId: req.params.instanceId },
      { $set: { config, aiPrompt } },
      { new: true }
    );
    if (!updatedConfig) {
      return res.status(404).json({ message: 'Widget not found' });
    }
    res.json(updatedConfig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a widget configuration
// @route   DELETE /api/widgets/:instanceId
const deleteWidgetConfig = async (req, res) => {
  try {
    const deletedConfig = await WidgetConfig.findOneAndDelete({
      user: req.user.id,
      instanceId: req.params.instanceId,
    });
    if (!deletedConfig) {
      return res.status(404).json({ message: 'Widget not found' });
    }
    res.json({ message: 'Widget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWidgetConfigs,
  addWidgetConfig,
  updateWidgetLayouts,
  updateWidgetConfig,
  deleteWidgetConfig,
};
