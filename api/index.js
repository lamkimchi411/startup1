import authHandler from './_handlers/auth.js';
import bookingsHandler from './_handlers/bookings.js';
import healthHandler from './_handlers/health.js';
import initHandler from './_handlers/init.js';
import servicesHandler from './_handlers/services.js';
import settingsHandler from './_handlers/settings.js';
import statsHandler from './_handlers/stats.js';
import uploadHandler from './_handlers/upload.js';
import usersHandler from './_handlers/users.js';
import galleryHandler from './_handlers/gallery.js';
import { cors } from './_lib/cors.js';

async function parseJsonIfNeeded(req) {
  const contentType = req.headers['content-type'] || '';

  // Skip parsing for multipart (file uploads handled by multer)
  if (contentType.includes('multipart/form-data')) return;

  // Only parse body for methods that carry a request body
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) return;

  // If Vercel (or another layer) already parsed body into a non-empty object,
  // trust it and return early.
  if (
    req.body !== undefined &&
    req.body !== null &&
    typeof req.body === 'object' &&
    !Buffer.isBuffer(req.body) &&
    Object.keys(req.body).length > 0
  ) {
    return;
  }

  // If body is a string (some runtimes pass raw string), parse it.
  if (typeof req.body === 'string') {
    try {
      req.body = req.body ? JSON.parse(req.body) : {};
    } catch {
      req.body = {};
    }
    return;
  }

  // Fallback: read the body stream manually.
  // This covers Vercel with bodyParser disabled, or any case where body was
  // not pre-parsed (or was parsed to an empty {} by the platform).
  try {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const data = Buffer.concat(buffers).toString('utf-8');
    req.body = data ? JSON.parse(data) : {};
  } catch (e) {
    // If body was already consumed by the platform, the stream will yield
    // nothing and we end up here with an empty body.
    if (!req.body || (typeof req.body === 'object' && Object.keys(req.body).length === 0)) {
      req.body = {};
    }
  }
}

export default async function handler(req, res) {
  try {
    if (cors(req, res)) return;

    // Resolve the original request URL. On Vercel rewrites, req.url usually
    // still contains the original path, but use additional Vercel headers as
    // fallbacks in case it only contains the destination path (/api/index.js).
    const url =
      req.url ||
      req.headers['x-invoke-path'] ||
      req.headers['x-matched-path'] ||
      req.headers['x-original-url'] ||
      '';

    // Persist the resolved URL so all downstream handlers see the original
    // path instead of the rewritten /api/index.js destination.
    req.url = url;
    if (!req.originalUrl) req.originalUrl = url;

    // Ensure req.query is populated from the URL query string.
    // Vercel usually sets this, but with bodyParser disabled or after rewrites
    // it may be missing or stale.
    if (!req.query || Object.keys(req.query).length === 0) {
      try {
        const qIndex = url.indexOf('?');
        if (qIndex !== -1) {
          const params = new URLSearchParams(url.slice(qIndex + 1));
          req.query = Object.fromEntries(params.entries());
        } else {
          req.query = {};
        }
      } catch {
        req.query = {};
      }
    }

    await parseJsonIfNeeded(req);

    // Diagnostic: log when a write request arrives with an empty body,
    // which usually indicates a body-parsing failure on Vercel.
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const bodyKeys = req.body ? Object.keys(req.body) : [];
      if (bodyKeys.length === 0) {
        console.warn('[API Router] Empty body for', req.method, url,
          '| Content-Type:', req.headers['content-type'],
          '| typeof body:', typeof req.body);
      }
    }

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
    if (url.includes('/gallery')) {
      return await galleryHandler(req, res);
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
