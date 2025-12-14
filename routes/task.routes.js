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

router.post('/', validateTask, taskController.create);
router.get('/', taskController.list);
router.get('/deleted', taskController.listDeleted);
router.get('/:id', validateTaskId, taskController.get);
router.put('/:id', validateTaskId, validateTaskUpdate, taskController.update);
router.delete('/:id', validateTaskId, taskController.softDelete);
router.delete('/hard/:id', validateTaskId, taskController.hardDelete);
router.patch('/restore/:id', validateTaskId, taskController.restore);

module.exports = router;
