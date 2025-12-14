const { Task } = require('../models');

async function create(req, res) {
  try {
    const task = await Task.createTask(req.body);
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function list(req, res) {
  try {
    const tasks = await Task.getAllTasks();
    res.json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: tasks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function get(req, res) {
  try {
    const task = await Task.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, message: 'Task retrieved successfully', data: task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function update(req, res) {
  try {
    const task = await Task.updateTaskById(req.params.id, req.body);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, message: 'Task updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function remove(req, res) {
  try {
    const task = await Task.deleteTaskById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { create, list, get, update, remove };
