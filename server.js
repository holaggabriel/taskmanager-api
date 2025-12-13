const express = require('express');
require('dotenv').config();
const authenticateToken = require('./middleware/auth');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);

app.get('/', authenticateToken, (req, res) => {
  res.send('Task Manager API - Authenticated');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
