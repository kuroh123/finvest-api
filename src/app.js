const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(express.json());
// app.use(cors({ origin: true, credentials: true }));
const allowedOrigins = ["https://finvest.obaidur.dev"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight explicitly (sometimes needed on Render)
app.options(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
// routes

app.use("/api/auth", require("./routes/auth"));
app.use("/api/invoices", require("./routes/invoice"));
app.use("/api/offers", require("./routes/offer"));
app.use("/api/payments", require("./routes/payment"));
app.use("/api/settlements", require("./routes/settlement"));

module.exports = app;
