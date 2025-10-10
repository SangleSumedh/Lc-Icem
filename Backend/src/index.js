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

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://lc-icem-sumedh.vercel.app",
];

// ✅ CORS options
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      // Allow server-to-server or Render internal requests
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200, // 👈 ensures successful response for preflight on some browsers
};

// ✅ Apply CORS middleware
app.use(cors(corsOptions));

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
