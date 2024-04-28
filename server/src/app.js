import express from "express";
import authRoutes from "./routes/auth.routes.js";
const app = express();
app.use(express.json());





// routes
app.use("/api/v1/auth", authRoutes);

export { app };
