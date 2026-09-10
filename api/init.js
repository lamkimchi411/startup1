import { getDb } from './_lib/db.js';
import { cors } from './_lib/cors.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Use POST to initialize database' });

  try {
    const sql = getDb();

    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        email VARCHAR(100) DEFAULT NULL,
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        category_id INT DEFAULT NULL,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        duration_minutes INT NOT NULL DEFAULT 45,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT fk_service_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS salon_settings (
        id INT PRIMARY KEY DEFAULT 1,
        salon_name VARCHAR(150) DEFAULT 'LUXURY NAILS & SPA',
        address VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(100),
        open_time VARCHAR(10) DEFAULT '08:30',
        close_time VARCHAR(10) DEFAULT '20:30',
        cancel_deadline_hours INT DEFAULT 4,
        notice_banner TEXT
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        booking_code VARCHAR(20) UNIQUE NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_email VARCHAR(100),
        booking_date DATE NOT NULL,
        booking_time VARCHAR(10) NOT NULL,
        total_duration INT NOT NULL DEFAULT 60,
        total_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        cancel_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS booking_services (
        id SERIAL PRIMARY KEY,
        booking_id INT NOT NULL,
        service_id INT NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        CONSTRAINT fk_bs_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        CONSTRAINT fk_bs_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS homepage_content (
        id INT PRIMARY KEY DEFAULT 1,
        hero_subtitle VARCHAR(150) DEFAULT 'LUXURY NAILS SPA',
        hero_title TEXT,
        hero_description TEXT,
        hero_image_url TEXT,
        working_hours_info VARCHAR(255),
        collection_info TEXT,
        contact_info TEXT
      )
    `;

    console.log('[Init] Tables created successfully.');

    // Seed admin user
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`;
    if (parseInt(existingUsers[0].count) === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await sql`
        INSERT INTO users (username, password, full_name, role)
        VALUES ('admin', ${hashedPassword}, 'Quản Trị Viên', 'admin')
      `;
      console.log('[Seed] Default admin account created: admin / admin123');
    }

    // Seed categories
    const existingCategories = await sql`SELECT COUNT(*) as count FROM categories`;
    if (parseInt(existingCategories[0].count) === 0) {
      await sql`INSERT INTO categories (id, name, description) VALUES (1, 'Chăm sóc móng cơ bản', 'Cắt da, tạo phom móng, sơn dưỡng thiên nhiên')`;
      await sql`INSERT INTO categories (id, name, description) VALUES (2, 'Sơn Gel & Vẽ Nghệ Thuật (Gel Art)', 'Sơn gel cao cấp bền màu từ 3-4 tuần, đính đá, vẽ ombre')`;
      await sql`INSERT INTO categories (id, name, description) VALUES (3, 'Úp móng & Nối móng đắp bột', 'Kỹ thuật móng úp thạch, đắp bột ombre sang trọng')`;
      await sql`INSERT INTO categories (id, name, description) VALUES (4, 'Spa & Chăm sóc Chân', 'Tẩy tế bào chết, chà gót chân hồng hào, massage thảo dược')`;
      await sql`SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 1))`;
      console.log('[Seed] Categories seeded.');
    }

    // Seed services
    const existingServices = await sql`SELECT COUNT(*) as count FROM services`;
    if (parseInt(existingServices[0].count) === 0) {
      await sql`INSERT INTO services (category_id, name, description, price, duration_minutes, image_url, is_active) VALUES
        (1, 'Manicure Cơ Bản & Dưỡng OPI', 'Vệ sinh da tay, dũa tạo phom, sơn dưỡng bảo vệ móng tự nhiên OPI.', 120000, 30, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80', true)`;
      await sql`INSERT INTO services (category_id, name, description, price, duration_minutes, image_url, is_active) VALUES
        (1, 'Pedicure Spa Thảo Dược', 'Ngâm chân thảo mộc thiên nhiên, vệ sinh móng chân, massage nhẹ nhàng.', 180000, 40, 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&auto=format&fit=crop&q=80', true)`;
      await sql`INSERT INTO services (category_id, name, description, price, duration_minutes, image_url, is_active) VALUES
        (2, 'Sơn Gel Hàn Quốc Cao Cấp', 'Sơn gel 3 lớp bóng bền màu trên 3 tuần, bảo hành bong tróc 7 ngày.', 220000, 45, 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&auto=format&fit=crop&q=80', true)`;
      await sql`INSERT INTO services (category_id, name, description, price, duration_minutes, image_url, is_active) VALUES
        (2, 'Sơn Gel Mắt Mèo & Ombre', 'Hiệu ứng mắt mèo kim cương lấp lánh hoặc phối màu ombre chuyển sắc tinh tế.', 280000, 60, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80', true)`;
      await sql`INSERT INTO services (category_id, name, description, price, duration_minutes, image_url, is_active) VALUES
        (3, 'Úp Móng Thạch Design Đính Đá VIP', 'Nối móng thạch ôm phom tự nhiên, thiết kế hoạ tiết nghệ thuật & đính đá SW.', 450000, 90, 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&auto=format&fit=crop&q=80', true)`;
      await sql`INSERT INTO services (category_id, name, description, price, duration_minutes, image_url, is_active) VALUES
        (3, 'Đắp Bột Ombre Khai Thấu', 'Kỹ thuật đắp bột cao cấp Mỹ, tạo móng thuôn dài thanh thoát.', 390000, 75, 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80', true)`;
      await sql`INSERT INTO services (category_id, name, description, price, duration_minutes, image_url, is_active) VALUES
        (4, 'Chà Gót Chân Chuyên Sâu Tế Bào Chết', 'Tẩy da chết chuyên sâu, dùng đá núi lửa chà gót hồng mềm mịn, thoa kem dưỡng.', 250000, 45, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80', true)`;
      await sql`INSERT INTO services (category_id, name, description, price, duration_minutes, image_url, is_active) VALUES
        (4, 'Combo Trọn Gói Luxury Spa Hands & Feet', 'Trọn gói Manicure + Pedicure Spa + Sơn Gel + Chà gót + Massage nến thơm.', 650000, 120, 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&auto=format&fit=crop&q=80', true)`;
      await sql`SELECT setval('services_id_seq', COALESCE((SELECT MAX(id) FROM services), 1))`;
      console.log('[Seed] Services seeded.');
    }

    // Seed salon settings
    const existingSettings = await sql`SELECT COUNT(*) as count FROM salon_settings`;
    if (parseInt(existingSettings[0].count) === 0) {
      await sql`
        INSERT INTO salon_settings (id, salon_name, address, phone, email, open_time, close_time, cancel_deadline_hours, notice_banner)
        VALUES (1, 'LUXURY NAILS & SPA', '123 Đường Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh', '0908 123 456', 'booking@luxurynails.vn', '08:30', '20:30', 4, '✨ Giảm ngay 20% cho quý khách đặt lịch trước qua Website!')
      `;
      console.log('[Seed] Salon settings initialized.');
    }

    // Seed homepage content
    const existingHomepage = await sql`SELECT COUNT(*) as count FROM homepage_content`;
    if (parseInt(existingHomepage[0].count) === 0) {
      await sql`
        INSERT INTO homepage_content (id, hero_subtitle, hero_title, hero_description, hero_image_url, working_hours_info, collection_info, contact_info)
        VALUES (1, 'LUXURY NAILS SPA', 'Nâng tầm vẻ đẹp đôi tay bạn', 'Chọn dịch vụ, ngày giờ và gửi lịch hẹn trong vài thao tác. Tài khoản customer có thể theo dõi lịch đã đặt ngay bên dưới.', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop&q=80', 'Thứ 2 - Chủ Nhật: 08:30 - 20:30', 'Bộ sưu tập mẫu móng Gel Art & Úp Móng Thạch 2026', 'Hotline: 0908 123 456 - Địa chỉ: 123 Đường Nguyễn Huệ, Quận 1, TP.HCM')
      `;
      console.log('[Seed] Homepage content initialized.');
    }

    res.json({
      message: '✅ Database initialized successfully!',
      details: 'Tables created and seed data inserted.'
    });
  } catch (err) {
    console.error('Init error:', err);
    res.status(500).json({ message: 'Database initialization failed', error: err.message });
  }
}
