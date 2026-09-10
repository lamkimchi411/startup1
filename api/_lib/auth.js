import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'luxury_nail_secret_key_2026';

export function verifyToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAuth(req, res) {
  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ message: 'Vui lòng đăng nhập hệ thống' });
    return null;
  }
  return user;
}

export function requireAdmin(req, res) {
  const user = requireAuth(req, res);
  if (user && user.role !== 'admin') {
    res.status(403).json({ message: 'Quyền truy cập bị từ chối' });
    return null;
  }
  return user;
}
