const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const itemsRouter = require('./routes/items');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');

app.use('/api/items', itemsRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// React SPA fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TaskFlow server running on port ${PORT}`);
});