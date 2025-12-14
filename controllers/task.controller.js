const { Task } = require('../models');

async function create(req, res) {
  try {
    const { title, description, status } = req.body;
    const userId = req.user.id;
    console.log(userId)

    const task = await Task.createWithOwner({ title, description, status, userId });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
}


async function list(req, res) {
  try {
    const userId = req.user.id;
    const tasks = await Task.getAllTasksForUser(userId);

    res.json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: {tasks: tasks}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function get(req, res) {
  try {
    const userId = req.user.id;
    const task = await Task.getTaskByIdForUser(req.params.id, userId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, message: 'Task retrieved successfully', data: {task: task} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function update(req, res) {
  try {
    const userId = req.user.id;
    const task = await Task.updateTaskForUser(req.params.id, userId, req.body);

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
