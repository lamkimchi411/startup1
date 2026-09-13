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
    try {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const data = Buffer.concat(buffers).toString('utf-8');
      if (data) {
        req.body = JSON.parse(data);
      } else {
        req.body = {};
      }
    } catch (e) {
      req.body = {};
    }
  }
}

export default async function handler(req, res) {
  if (cors(req, res)) return;

  const url = req.url || '';

  await parseJsonIfNeeded(req);

  if (url.includes('/api/health')) {
    return healthHandler(req, res);
  }
  if (url.includes('/api/init')) {
    return initHandler(req, res);
  }
  if (url.includes('/api/auth')) {
    return authHandler(req, res);
  }
  if (url.includes('/api/bookings')) {
    return bookingsHandler(req, res);
  }
  if (url.includes('/api/services/upload') || url.includes('/api/upload')) {
    return uploadHandler(req, res);
  }
  if (url.includes('/api/services')) {
    return servicesHandler(req, res);
  }
  if (url.includes('/api/settings')) {
    return settingsHandler(req, res);
  }
  if (url.includes('/api/stats')) {
    return statsHandler(req, res);
  }
  if (url.includes('/api/users')) {
    return usersHandler(req, res);
  }

  return res.status(404).json({ message: `API Route Not Found: ${url}` });
}
