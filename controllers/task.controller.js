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

async function listDeleted(req, res) {
  try {
    const userId = req.user.id;
    const tasks = await Task.getDeletedTasksForUser(userId);

    res.json({
      success: true,
      message: 'Deleted tasks retrieved successfully',
      data: { tasks }
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

async function softDelete(req, res) {
  try {
    const userId = req.user.id;
    const task = await Task.softDeleteTaskForUser(req.params.id, userId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function softDeleteAll(req, res) {
  try {
    const userId = req.user.id;

    const deletedCount = await Task.softDeleteAllTasksForUser(userId);

    if (deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'No tasks found to soft delete' });
    }

    res.json({ 
      success: true, 
      message: `Soft deleted ${deletedCount} task(s)` 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function hardDelete(req, res) {
  try {
    const userId = req.user.id;
    const task = await Task.hardDeleteTaskForUser(req.params.id, userId);

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, message: 'Task permanently deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function hardDeleteAll(req, res) {
  try {
    const userId = req.user.id;

    // Llamamos al método que elimina todas las tareas del usuario
    const deletedCount = await Task.hardDeleteAllTasksForUser(userId);

    if (deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'No tasks found to delete' });
    }

    res.json({ 
      success: true, 
      message: `Permanently deleted ${deletedCount} task(s)` 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function restore(req, res) {
  try {
    const userId = req.user.id;
    const task = await Task.restoreTaskForUser(req.params.id, userId);

    if (!task) return res.status(404).json({ success: false, message: 'Task not found or not deleted' });

    res.json({ success: true, message: 'Task restored successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function restoreAll(req, res) {
  try {
    const userId = req.user.id;

    const restoredCount = await Task.restoreAllTasksForUser(userId);

    if (restoredCount === 0) {
      return res.status(404).json({ success: false, message: 'No deleted tasks found to restore' });
    }

    res.json({ 
      success: true, 
      message: `Restored ${restoredCount} task(s)` 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { create, list, listDeleted, get, update, softDelete, hardDelete, restore, hardDeleteAll, restoreAll, softDeleteAll};
