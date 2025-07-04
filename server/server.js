import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import resumeRoutes from "./api/resumeRoutes.js";
import registerRoute from "./api/register.js";
import loginRoute from "./api/login.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/api/register", registerRoute);
app.use("/api/login", loginRoute);
app.use("/api/resumes", resumeRoutes);

app.get("/", (req, res) => res.send("API running"));
app.listen(3000, () => console.log("Server running on port 3000!!:"));
