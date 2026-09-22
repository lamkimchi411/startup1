// Run with NODE_PATH pointing to an installed Playwright package; Vite must be running.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    let items = [{ id: 1, title: 'Existing gallery item', image_url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' }];
    const writes = [];
    let failSave = false;
    await page.addInitScript(() => localStorage.setItem('admin_token', 'ui-test'));
    await page.route('**/api/**', async route => {
      const request = route.request();
      const url = new URL(request.url());
      let body = {};
      if (url.pathname === '/api/auth/me') body = { user: { role: 'admin', username: 'test' } };
      if (url.pathname === '/api/services') body = { services: [], categories: [] };
      if (url.pathname === '/api/gallery') {
        if (request.method() !== 'GET') {
          if (failSave) return route.fulfill({ status: 500, json: { message: 'Test save failed' } });
          const data = request.postDataJSON();
          writes.push({ method: request.method(), data });
          if (request.method() === 'POST') items.push({ ...data, id: 2 });
          if (request.method() === 'PUT') items = items.map(item => String(item.id) === url.searchParams.get('id') ? { ...item, ...data } : item);
          body = { message: 'ok' };
        } else body = items;
      }
      await route.fulfill({ json: body });
    });
    await page.goto('http://127.0.0.1:5173');
    await page.getByRole('button', { name: 'Cài đặt salon', exact: true }).click();
    await page.setViewportSize({ width: 660, height: 498 });
    await page.getByRole('button', { name: 'Sửa', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    const bounds = await dialog.boundingBox();
    assert(bounds.y >= 0 && bounds.y + bounds.height <= 498, 'Dialog must stay inside the scrolled viewport');
    await dialog.getByPlaceholder('Ví dụ: Sơn Gel Hàn Quốc Đính Đá VIP').fill('Edited gallery item');
    await dialog.getByRole('button', { name: 'LƯU CẬP NHẬT', exact: true }).click();
    await dialog.waitFor({ state: 'detached' });
    await page.getByText('Edited gallery item', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Thêm Mẫu Móng Mới', exact: true }).click();
    await dialog.getByPlaceholder('Ví dụ: Sơn Gel Hàn Quốc Đính Đá VIP').fill('New gallery item');
    await dialog.getByPlaceholder('Nhập link ảnh (https://...) hoặc tải file lên bên dưới').fill(items[0].image_url);
    failSave = true;
    await dialog.getByRole('button', { name: 'THÊM MẪU MÓNG', exact: true }).click();
    await dialog.getByRole('alert').getByText('Test save failed').waitFor();
    failSave = false;
    await dialog.getByRole('button', { name: 'THÊM MẪU MÓNG', exact: true }).click();
    await dialog.waitFor({ state: 'detached' });
    await page.getByText('New gallery item', { exact: true }).waitFor();
    assert.deepEqual(writes.map(write => write.method), ['PUT', 'POST']);
    console.log('PASS: scrolled mobile dialog, edit, add, visible save error and retry');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
