const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// routes
const auth = require('./routers/auth');

app.use('/api/auth', auth);

module.exports = app;