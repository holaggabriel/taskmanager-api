function validateTask(req, res, next) {
    const { title, description, status } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Title is required' });
    }

    if (!description || !description.trim()) {
        return res.status(400).json({ success: false, message: 'Description is required' });
    }

    if (title.length > 255) {
        return res.status(400).json({ success: false, message: 'Title must be at most 255 characters' });
    }

    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    next();
}

module.exports = validateTask;
