import express from "express";
import authRoutes from "./routes/auth.routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

// routes
app.use("/api/v1/auth", authRoutes);

export { app };
