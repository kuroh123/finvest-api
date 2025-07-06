const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

exports.registerUser = async (req, res) => {
    const { email, password } = req.body;
    try {
      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashed },
      });
      res.json({ id: user.id, email: user.email });
    } catch (err) {
      res.status(400).json({ error: 'Email may already exist' });
    }
  }

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    console.log(hashed)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
  
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ user: user.email, token });
  }