import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import imageRouter from "./routes/imageRoutes.js";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

 

app.use(cors ({
    origin: "http://localhost:5173",
}));

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);
app.use("/api/images", imageRouter);
app.use("/api/images/:id" , imageRouter); 

app.use((err, _req, res, _next) => {
  const status = err instanceof multer.MulterError ? 400 : 500;
  res.status(status).json({
    message: err.message || "Something went wrong.",
  });
});

const PORT = process.env.PORT || 5006;

try {
    await mongoose.connect(process.env.MONGO_URI,);
    console.log("MongoDb connected " )

  app.listen(PORT, () => {
    console.log(`server Running on Port http://localhost:${PORT}`);
  });
} catch (error) {
    console.log("server running failed please check your Backend" , error . message);
    process.exit(1);
}

