import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  multipleStatements: true
};

const DB_NAME = process.env.DB_NAME || 'luxury_nail_db';

export let pool = null;

export async function initDatabase() {
  const portsToTry = process.env.DB_PORT
    ? [parseInt(process.env.DB_PORT, 10)]
    : [3306, 3307];

  let lastError = null;

  for (const port of portsToTry) {
    try {
      const activeConfig = { ...DB_CONFIG, port };
      console.log(`[MySQL] Attempting connection to localhost:${port}...`);

      const tempConnection = await mysql.createConnection(activeConfig);
      await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await tempConnection.end();

      pool = mysql.createPool({
        ...activeConfig,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      console.log(`[MySQL] Connected successfully to database '${DB_NAME}' on port ${port}.`);
      await createTables();
      await seedInitialData();
      return pool;
    } catch (err) {
      lastError = err;
      console.warn(`[MySQL Notice] Could not connect to MySQL on port ${port}: ${err.message}`);
    }
  }

  console.error('[MySQL Error] Failed to initialize MySQL database on ports', portsToTry, ':', lastError?.message);
  console.log('[MySQL Notice] Make sure MySQL Server / XAMPP MySQL is running (User: root, Pass: empty/your pass).');
  throw lastError;
}

async function createTables() {
  const schemaSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) DEFAULT NULL,
      email VARCHAR(100) DEFAULT NULL,
      role VARCHAR(20) DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT DEFAULT NULL,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      duration_minutes INT NOT NULL DEFAULT 45,
      image_url TEXT,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS salon_settings (
      id INT PRIMARY KEY DEFAULT 1,
      salon_name VARCHAR(150) DEFAULT 'LUXURY NAILS & SPA',
      address VARCHAR(255) DEFAULT '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
      phone VARCHAR(20) DEFAULT '0908 123 456',
      email VARCHAR(100) DEFAULT 'contact@luxurynails.vn',
      open_time VARCHAR(10) DEFAULT '08:30',
      close_time VARCHAR(10) DEFAULT '20:30',
      cancel_deadline_hours INT DEFAULT 4,
      notice_banner TEXT
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_code VARCHAR(20) UNIQUE NOT NULL,
      customer_name VARCHAR(100) NOT NULL,
      customer_phone VARCHAR(20) NOT NULL,
      customer_email VARCHAR(100),
      booking_date DATE NOT NULL,
      booking_time VARCHAR(10) NOT NULL,
      total_duration INT NOT NULL DEFAULT 60,
      total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      notes TEXT,
      status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
      cancel_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS booking_services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id INT NOT NULL,
      service_id INT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS homepage_content (
      id INT PRIMARY KEY DEFAULT 1,
      hero_subtitle VARCHAR(150) DEFAULT 'LUXURY NAILS SPA',
      hero_title TEXT,
      hero_description TEXT,
      hero_image_url TEXT,
      working_hours_info VARCHAR(255) DEFAULT 'Thứ 2 - Chủ Nhật: 08:30 - 20:30',
      collection_info TEXT,
      contact_info TEXT
    );
  `;

  await pool.query(schemaSQL);

  // Migration: Add missing columns to existing tables
  const migrations = [
    { table: 'users', column: 'email', sql: 'ALTER TABLE users ADD COLUMN email VARCHAR(100) DEFAULT NULL AFTER full_name' },
    { table: 'users', column: 'phone', sql: 'ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER full_name' },
  ];

  for (const m of migrations) {
    try {
      const [cols] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [DB_NAME, m.table, m.column]
      );
      if (cols.length === 0) {
        await pool.query(m.sql);
        console.log(`[Migration] Added column '${m.column}' to table '${m.table}'.`);
      }
    } catch (migErr) {
      // Column might already exist, ignore
      if (!migErr.message.includes('Duplicate column')) {
        console.warn(`[Migration Warning] ${m.column}: ${migErr.message}`);
      }
    }
  }
}

async function seedInitialData() {
  // Homepage content seed
  const [homepage] = await pool.query('SELECT COUNT(*) as count FROM homepage_content');
  if (homepage[0].count === 0) {
    await pool.query(`
      INSERT INTO homepage_content (id, hero_subtitle, hero_title, hero_description, hero_image_url, working_hours_info, collection_info, contact_info) VALUES
      (1, 
       'LUXURY NAILS SPA', 
       'Nâng tầm vẻ đẹp đôi tay bạn', 
       'Chọn dịch vụ, ngày giờ và gửi lịch hẹn trong vài thao tác. Tài khoản customer có thể theo dõi lịch đã đặt ngay bên dưới.',
       'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop&q=80',
       'Thứ 2 - Chủ Nhật: 08:30 - 20:30',
       'Bộ sưu tập mẫu móng Gel Art & Úp Móng Thạch 2026',
       'Hotline: 0908 123 456 - Địa chỉ: 123 Đường Nguyễn Huệ, Quận 1, TP.HCM'
      )
    `);
    console.log('[Seed] Homepage content initialized.');
  }
  // Admin user seed
  const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
  if (users[0].count === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
      ['admin', hashedPassword, 'Quản Trị Viên', 'admin']
    );
    console.log('[Seed] Default admin account created: admin / admin123');
  }

  // Categories seed
  const [categories] = await pool.query('SELECT COUNT(*) as count FROM categories');
  if (categories[0].count === 0) {
    await pool.query(`
      INSERT INTO categories (id, name, description) VALUES
      (1, 'Chăm sóc móng cơ bản', 'Cắt da, tạo phom móng, sơn dưỡng thiên nhiên'),
      (2, 'Sơn Gel & Vẽ Nghệ Thuật (Gel Art)', 'Sơn gel cao cấp bền màu từ 3-4 tuần, đính đá, vẽ ombre'),
      (3, 'Úp móng & Nối móng đắp bột', 'Kỹ thuật móng úp thạch, đắp bột ombre sang trọng'),
      (4, 'Spa & Chăm sóc Chân', 'Tẩy tế bào chết, chà gót chân hồng hào, massage thảo dược');
    `);
    console.log('[Seed] Categories seeded.');
  }

  // Services seed
  const [services] = await pool.query('SELECT COUNT(*) as count FROM services');
  if (services[0].count === 0) {
    await pool.query(`
      INSERT INTO services (category_id, name, description, price, duration_minutes, image_url, is_active) VALUES
      (1, 'Manicure Cơ Bản & Dưỡng OPI', 'Vệ sinh da tay, dũa tạo phom, sơn dưỡng bảo vệ móng tự nhiên OPI.', 120000, 30, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80', 1),
      (1, 'Pedicure Spa Thảo Dược', 'Ngâm chân thảo mộc thiên nhiên, vệ sinh móng chân, massage nhẹ nhàng.', 180000, 40, 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&auto=format&fit=crop&q=80', 1),
      (2, 'Sơn Gel Hàn Quốc Cao Cấp', 'Sơn gel 3 lớp bóng bền màu trên 3 tuần, bảo hành bong tróc 7 ngày.', 220000, 45, 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&auto=format&fit=crop&q=80', 1),
      (2, 'Sơn Gel Mắt Mèo & Ombre', 'Hiệu ứng mắt mèo kim cương lấp lánh hoặc phối màu ombre chuyển sắc tinh tế.', 280000, 60, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80', 1),
      (3, 'Úp Móng Thạch Design Đính Đá VIP', 'Nối móng thạch ôm phom tự nhiên, thiết kế hoạ tiết nghệ thuật & đính đá SW.', 450000, 90, 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&auto=format&fit=crop&q=80', 1),
      (3, 'Đắp Bột Ombre Khai Thấu', 'Kỹ thuật đắp bột cao cấp Mỹ, tạo móng thuôn dài thanh thoát.', 390000, 75, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80', 1),
      (4, 'Chà Gót Chân Chuyên Sâu Tế Bào Chết', 'Tẩy da chết chuyên sâu, dùng đá núi lửa chà gót hồng mềm mịn, thoa kem dưỡng.', 250000, 45, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80', 1),
      (4, 'Combo Trọn Gói Luxury Spa Hands & Feet', 'Trọn gói Manicure + Pedicure Spa + Sơn Gel + Chà gót + Massage nến thơm.', 650000, 120, 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&auto=format&fit=crop&q=80', 1);
    `);
    console.log('[Seed] Services seeded.');
  }

  // Salon settings seed
  const [settings] = await pool.query('SELECT COUNT(*) as count FROM salon_settings');
  if (settings[0].count === 0) {
    await pool.query(`
      INSERT INTO salon_settings (id, salon_name, address, phone, email, open_time, close_time, cancel_deadline_hours, notice_banner) VALUES
      (1, 'LUXURY NAILS & SPA', '123 Đường Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh', '0908 123 456', 'booking@luxurynails.vn', '08:30', '20:30', 4, '✨ Giảm ngay 20% cho quý khách đặt lịch trước qua Website!')
    `);
    console.log('[Seed] Salon settings initialized.');
  }
}
