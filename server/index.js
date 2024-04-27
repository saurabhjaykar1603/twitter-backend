import dotenv from "dotenv";
dotenv.config();
import { app } from "./app.js";
import connectDB from "./db.js";

connectDB()
  .then(() => {
    app.listen(8000, () => {
      console.log(`⚙️ Server is running at port : 8000`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
