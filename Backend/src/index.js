import "dotenv/config";
import express from "express";
import cors from "cors";
// import dotenv from "dotenv";

import adminRoutes from "./routes/adminRoutes.js";
import deptRoutes from "./routes/deptRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

// dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//Routes
app.use("/auth", authRoutes);
app.use("/departments", deptRoutes);
app.use("/lc-form", studentRoutes);
app.use("/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
