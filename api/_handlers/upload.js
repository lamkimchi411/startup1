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

  // Vercel Blob injects this value after a Blob store is connected to the project.
  // Check it before parsing the upload so admins get an actionable message instead
  // of the raw SDK exception shown by Vercel.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      code: 'BLOB_NOT_CONFIGURED',
      message: 'Chức năng tải ảnh chưa được cấu hình trên Vercel. Hãy liên kết Vercel Blob với project rồi triển khai lại.'
    });
  }

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
    const message = err?.message?.includes('No token found')
      ? 'Chức năng tải ảnh chưa được cấu hình trên Vercel. Hãy liên kết Vercel Blob với project rồi triển khai lại.'
      : 'Không thể tải ảnh lên lúc này. Vui lòng thử lại.';
    res.status(500).json({ message });
  }
}
