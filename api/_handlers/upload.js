import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';
import multer from 'multer';
import { put } from '@vercel/blob';
import fs from 'fs';

const upload = multer({ dest: '/tmp/uploads' });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    await runMiddleware(req, res, upload.single('image'));

    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file ảnh để tải lên' });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const blob = await put(
      `nail-salon/${Date.now()}-${req.file.originalname}`,
      fileBuffer,
      {
        access: 'public',
        contentType: req.file.mimetype,
      }
    );

    try { fs.unlinkSync(req.file.path); } catch {}

    res.json({ message: 'Tải ảnh thành công', url: blob.url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Lỗi khi tải ảnh lên: ' + err.message });
  }
}
