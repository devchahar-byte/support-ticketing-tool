const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { app } = require('../src/server');

let server;
const port = 5099;

const request = (method, apiPath, body = null) => {
  return new Promise((resolve, reject) => {
    const fullPath = apiPath.startsWith('/api') ? apiPath : `/api${apiPath}`;
    const options = {
      method,
      hostname: '127.0.0.1',
      port,
      path: fullPath,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(port, '127.0.0.1', resolve);
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /api/health should return 200 OK', async () => {
  const res = await request('GET', '/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'OK');
});

test('GET /api/tickets should return list of tickets', async () => {
  const res = await request('GET', '/tickets');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.total >= 1);
});

test('GET /api/tickets/stats should return dashboard statistics', async () => {
  const res = await request('GET', '/tickets/stats');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(typeof res.body.data.total === 'number');
  assert.ok(typeof res.body.data.open === 'number');
});

test('POST /api/tickets should validate required fields', async () => {
  const res = await request('POST', '/tickets', { title: 'Incomplete' });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

test('POST /api/tickets should create a new ticket', async () => {
  const newTicket = {
    title: 'Test ticket from automated unit test',
    description: 'Verifying automated ticket creation flow.',
    priority: 'High',
    category: 'Technical',
    customerName: 'Test Runner',
    customerEmail: 'tester@example.com',
  };

  const res = await request('POST', '/tickets', newTicket);
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, newTicket.title);

  // Clean up
  if (res.body.data._id) {
    await request('DELETE', `/tickets/${res.body.data._id}`);
  }
});
