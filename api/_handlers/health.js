import { cors } from '../_lib/cors.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  res.json({ status: 'ok', time: new Date().toISOString() });
}
