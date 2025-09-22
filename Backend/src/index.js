import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // React app
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


//Routes
app.use("/auth", authRoutes);
app.use("/lc-form", studentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
