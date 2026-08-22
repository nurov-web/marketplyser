import fs from "fs";
import path from "path";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config";

const uploadPath = path.resolve(config.uploadDir);
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadPath),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Фақат расм иҷозат аст"));
      return;
    }
    cb(null, true);
  },
});

const useCloudinary = Boolean(config.cloudinaryUrl);
if (useCloudinary) {
  cloudinary.config({ url: config.cloudinaryUrl });
}

export async function persistFile(file: Express.Multer.File): Promise<string> {
  if (useCloudinary) {
    const result = await cloudinary.uploader.upload(file.path, { folder: "nurov" });
    fs.unlinkSync(file.path);
    return result.secure_url;
  }
  return `/uploads/${file.filename}`;
}
