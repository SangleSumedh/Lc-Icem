import "dotenv/config";
import express from "express";
import cors from "cors";

import adminRoutes from "./routes/adminRoutes.js";
import deptRoutes from "./routes/deptRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import registrarRoutes from "./routes/registrarRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Define allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://lc-icem-sumedh.vercel.app",
];

// ✅ Configure CORS properly
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn("❌ CORS blocked origin:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/departments", deptRoutes);
app.use("/lc-form", studentRoutes);
app.use("/admin", adminRoutes);
app.use("/registrar", registrarRoutes);
app.use("/tickets", ticketRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
