import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "API Running" });
});

// Auth routes → /api/auth/register, /login, /profile
app.use("/api/auth", authRoutes);

// Admin routes → /api/admin/* (ADMIN only)
app.use("/api/admin", adminRoutes);

// Store routes → /api/stores/* (ADMIN only)
app.use("/api/stores", storeRoutes);

// Rating routes → /api/ratings/* (USER + OWNER)
app.use("/api/ratings", ratingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
