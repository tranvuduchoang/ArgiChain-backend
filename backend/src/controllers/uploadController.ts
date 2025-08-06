import { Request, Response } from 'express';

export const uploadImage = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Đường dẫn trả về cho frontend (có thể cần chỉnh sửa nếu deploy)
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ url: fileUrl });
};