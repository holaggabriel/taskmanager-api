const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authToken');
const validateUserId = require('../middleware/validateUserId');
const validateTask = require('../middleware/validateTask');
const validateTaskUpdate = require('../middleware/validateTaskUpdate');
const taskController = require('../controllers/task.controller');

router.use(authenticateToken);
router.use(validateUserId);

router.post('/', validateTask, taskController.create);
router.get('/', taskController.list);
router.get('/:id', taskController.get);
router.put('/:id', validateTaskUpdate, taskController.update);
router.delete('/:id', taskController.remove);

module.exports = router;
