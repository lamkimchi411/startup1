import express from 'express';
import cors from 'cors';
import { initDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import serviceRoutes from './routes/services.js';
import bookingRoutes from './routes/bookings.js';
import settingRoutes from './routes/settings.js';
import statsRoutes from './routes/stats.js';
import userRoutes from './routes/users.js';
import galleryRoutes from './routes/gallery.js';

const app = express();
const PORT = process.env.PORT || 5000;

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gallery', galleryRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start Server after Database Initialization
async function startServer() {
  try {
    console.log('[Server] Initializing MySQL connection and schema...');
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`[Server] Express Backend is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Server Start Error] Failed to start backend server:', error.message);
    // Allow server to run even if DB fails initially, giving a friendly fallback message
    app.listen(PORT, () => {
      console.log(`[Server] Express Backend running on http://localhost:${PORT} (Database pending connection)`);
    });
  }
}

startServer();
