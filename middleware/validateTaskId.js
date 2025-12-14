// middleware/validateTaskId.js
module.exports = (req, res, next) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: 'Task ID is required' });
  next();
};