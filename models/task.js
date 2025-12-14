const pool = require('../config/db');

async function createTask(title, description, status = 'pending') {
    const query = `
        INSERT INTO tasks (title, description, status)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const values = [title, description, status];
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function getAllTasks() {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    return {tasks: result.rows};
}

async function getTaskById(id) {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return {task: result.rows[0]};
}

async function updateTask(id, fields) {
    const setClause = [];
    const values = [];

    let i = 1;
    for (const key in fields) {
        setClause.push(`${key} = $${i}`);
        values.push(fields[key]);
        i++;
    }
    values.push(id);

    const query = `UPDATE tasks SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function deleteTask(id) {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
}

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
};
