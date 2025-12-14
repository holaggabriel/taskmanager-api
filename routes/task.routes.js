const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authToken');
const validateUserId = require('../middleware/validateUserId');
const validateTaskId = require('../middleware/validateTaskId');
const validateTask = require('../middleware/validateTask');
const validateTaskUpdate = require('../middleware/validateTaskUpdate');
const taskController = require('../controllers/task.controller');

router.use(authenticateToken);
router.use(validateUserId);

// Crear y listar tareas
router.post('/', validateTask, taskController.create);
router.get('/', taskController.list);
router.get('/deleted', taskController.listDeleted);

// Endpoints masivos (sin :id)
router.delete('/soft', taskController.softDeleteAll);   // Soft delete todas las tareas
router.delete('/hard', taskController.hardDeleteAll);   // Hard delete todas las tareas
router.patch('/restore', taskController.restoreAll);    // Restaurar todas las tareas

// Endpoints individuales (con :id primero, luego acción)
router.get('/:id', validateTaskId, taskController.get);
router.put('/:id', validateTaskId, validateTaskUpdate, taskController.update);
router.delete('/:id/soft', validateTaskId, taskController.softDelete);
router.delete('/:id/hard', validateTaskId, taskController.hardDelete);
router.patch('/:id/restore', validateTaskId, taskController.restore);

module.exports = router;
