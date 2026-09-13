import authHandler from './_handlers/auth.js';
import bookingsHandler from './_handlers/bookings.js';
import healthHandler from './_handlers/health.js';
import initHandler from './_handlers/init.js';
import servicesHandler from './_handlers/services.js';
import settingsHandler from './_handlers/settings.js';
import statsHandler from './_handlers/stats.js';
import uploadHandler from './_handlers/upload.js';
import usersHandler from './_handlers/users.js';
import { cors } from './_lib/cors.js';

async function parseJsonIfNeeded(req) {
  if (req.body) return;
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) return;

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (req.readableEnded || req.complete) {
      req.body = req.body || {};
      return;
    }
    try {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const data = Buffer.concat(buffers).toString('utf-8');
      req.body = data ? JSON.parse(data) : {};
    } catch (e) {
      req.body = {};
    }
  }
}

export default async function handler(req, res) {
  try {
    if (cors(req, res)) return;

    const url = req.url || req.headers['x-matched-path'] || req.headers['x-original-url'] || '';

    await parseJsonIfNeeded(req);

    if (url.includes('/health')) {
      return await healthHandler(req, res);
    }
    if (url.includes('/init')) {
      return await initHandler(req, res);
    }
    if (url.includes('/auth')) {
      return await authHandler(req, res);
    }
    if (url.includes('/bookings')) {
      return await bookingsHandler(req, res);
    }
    if (url.includes('/services/upload') || url.includes('/upload')) {
      return await uploadHandler(req, res);
    }
    if (url.includes('/services')) {
      return await servicesHandler(req, res);
    }
    if (url.includes('/settings')) {
      return await settingsHandler(req, res);
    }
    if (url.includes('/stats')) {
      return await statsHandler(req, res);
    }
    if (url.includes('/users')) {
      return await usersHandler(req, res);
    }

    return res.status(404).json({ message: `API Route Not Found: ${url}` });
  } catch (error) {
    console.error('[API Router Exception]', error);
    return res.status(500).json({
      message: 'Lỗi hệ thống máy chủ Serverless',
      error: error.message || String(error)
    });
  }
}
