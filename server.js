require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// Basic abuse protection on the write endpoints
const writeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
app.use('/api/contact', writeLimiter);
app.use('/api/upload', writeLimiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', apiRoutes);
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Portfolio running at http://localhost:${PORT}`));
