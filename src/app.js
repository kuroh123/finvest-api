const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.get('/users', async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
  });
  
app.post('/users', async (req, res) => {
    const { name, email } = req.body;
    const user = await prisma.user.create({
        data: { name, email }
    });
    res.json(user);
});

module.exports = app;