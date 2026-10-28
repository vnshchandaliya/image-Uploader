import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import {randomUUID} from "crypto";

import Image from "../models/image.js";

const router = express.Router();

const uploadDir = path.resolve("uploads");

fs.mkdirSync(uploadDir, {recursive:true});

const storage = multer.diskStorage({
    destination:(_req, _file, cb) => {
        cb(null , uploadDir);
    },
    filename:(_req, file,cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`) 
  }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    filter: (_req, file,cb) => {
        if(!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)){
            return cb(new Error("Only .jpeg, .png, and .webp formats are allowed!"));
        }
        cb(null, true);

    },
});

router.post("/", upload.single("image"), async (req, res) => {

    let savedPath;
    try {
        if(!req. file) {
            return res.status(400).json({message:" please Selected an image "});
        }
        savedPath =path.join(uploadDir, req.file.filename);

        const image = await Image.create({
            filename:req.file.filename,
            originalName:req.file.originalname,
            imageUrl:`/upload/${req.file.filename}`,
        });
        res.status(201).json({message:"Image uploaded successfully", image

        });
    }catch(error){
        if(savedPath){
            await fs.promises.unlink(savedPath);
        }
        next(error);
    }
});

router.get("/", async (_req, res, next) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });

    res.json(
      images.map((image) => {
        const item = image.toObject();

        return {
          ...item,
          imageUrl: item.imageUrl.replace(/^\/upload\//, "/uploads/"),
        };
      })
    );
  } catch (error) {
    next(error);
  }
});

// Delete image by ID
 
router.delete("/:id", async (req, res, next) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        message: "Image not found",
      });
    }

    const filePath = path.join(
      uploadDir,
      path.basename(image.filename)
    );

    // Delete physical image file
    try {
      await fsPromises.unlink(filePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    // Delete MongoDB record
    await Image.findByIdAndDelete(image._id);

    return res.status(200).json({
      message: "Image deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});


export default router;