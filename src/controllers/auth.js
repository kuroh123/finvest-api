const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");

exports.registerUser = async (req, res) => {
  const { email, password, role, name } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, role, name },
    });
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    // Set cookie
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   sameSite: "lax",
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: 24 * 60 * 60 * 1000,
    // });
    res.json({ id: user.id, email: user.email, token, role: user.role });
  } catch (err) {
    res.status(400).json({ error: "Email may already exist" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  // res.cookie("token", token, {
  //   httpOnly: true,
  //   sameSite: "lax",
  //   secure: process.env.NODE_ENV === "production",
  //   maxAge: 24 * 60 * 60 * 1000,
  // });
  res.json({ user: user.email, token, role: user.role, id: user.id });
};
