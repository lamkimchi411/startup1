import { cors } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';
import multer from 'multer';
import { put } from '@vercel/blob';
import fs from 'fs';

const MAX_INLINE_IMAGE_SIZE = 2 * 1024 * 1024;
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const upload = multer({
  dest: '/tmp/uploads',
  limits: { fileSize: MAX_INLINE_IMAGE_SIZE },
  fileFilter: (_req, file, callback) => {
    callback(null, allowedImageTypes.has(file.mimetype));
  }
});

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
    let url;
    let storage = 'inline';

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(
        `nail-salon/${Date.now()}-${req.file.originalname}`,
        fileBuffer,
        { access: 'public', contentType: req.file.mimetype, addRandomSuffix: true }
      );
      url = blob.url;
      storage = 'blob';
    } else {
      // Fallback for existing deployments without a connected Blob store. Neon TEXT
      // accepts the data URL and the current hero/gallery schema needs no migration.
      url = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
    }

    try { fs.unlinkSync(req.file.path); } catch {}
    res.json({
      message: storage === 'blob' ? 'Tải ảnh thành công' : 'Tải ảnh thành công (lưu trực tiếp trong dữ liệu website)',
      url,
      storage
    });
  } catch (err) {
    console.error('Upload error:', err);
    const message = err?.code === 'LIMIT_FILE_SIZE'
      ? 'Ảnh quá lớn. Vui lòng chọn ảnh tối đa 2 MB.'
      : 'Không thể tải ảnh lên lúc này. Vui lòng dùng ảnh JPG, PNG, WebP hoặc GIF (tối đa 2 MB).';
    res.status(500).json({ message });
  }
}
