const express = require('express');
const cors = require('cors');
const path = require('path');

const itemsRouter = require('./routes/items');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/items', itemsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TaskFlow server running on port ${PORT}`);
});
