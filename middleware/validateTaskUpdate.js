function validateTaskUpdate(req, res, next) {
    const { title, description, status } = req.body;

    if (!title && !description && !status) {
        return res.status(400).json({ success: false, message: 'At least one field (title, description, status) must be provided' });
    }

    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    next();
}

module.exports = validateTaskUpdate;
