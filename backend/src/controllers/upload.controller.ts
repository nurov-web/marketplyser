import { Response } from "express";
import { persistFile } from "../lib/upload";
import { AuthedRequest } from "../middleware/auth";

export async function uploadImage(req: AuthedRequest, res: Response) {
  const file = req.file;
  if (!file) return res.status(400).json({ message: "Файл нест" });
  const url = await persistFile(file);
  return res.json({ url });
}

export async function uploadImages(req: AuthedRequest, res: Response) {
  const files = (req.files as Express.Multer.File[]) || [];
  if (!files.length) return res.status(400).json({ message: "Файлҳо нестанд" });
  const urls = [];
  for (const file of files) urls.push(await persistFile(file));
  return res.json({ urls });
}
