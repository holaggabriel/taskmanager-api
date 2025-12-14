const {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
} = require('../models/task');

async function create(req, res) {
    const { title, description, status } = req.body;
    const task = await createTask(title, description, status);
    res.status(201).json({ success: true, message: 'Task created successfully' });
}

async function list(req, res) {
    const tasks = await getAllTasks();
    res.json({ success: true, message: 'List tasks got successfully', data: tasks });
}

async function get(req, res) {
    const { id } = req.params;
    const task = await getTaskById(id);
    if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task got successfully', data: task });
}

async function update(req, res) {
    const { id } = req.params;
    const fields = req.body;

    const task = await updateTask(id, fields);
    if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task updated successfully' });
}

async function remove(req, res) {
    const { id } = req.params;
    const task = await deleteTask(id);
    if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
}

module.exports = { create, list, get, update, remove };
