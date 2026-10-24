const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { app } = require('../src/server');

let server;
const port = 5098;

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

test('POST /api/tickets - should return 400 when title or description is missing', async () => {
  const res = await request('POST', '/tickets', {
    priority: 'HIGH',
    status: 'OPEN',
  });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.ok(Array.isArray(res.body.errors));
});

test('POST /api/tickets - should create ticket with exact milestone fields and return 201 Created', async () => {
  const payload = {
    title: 'Unable to login',
    description: 'Login issue',
    priority: 'HIGH',
    status: 'OPEN',
    category: 'TECHNICAL',
  };

  const res = await request('POST', '/tickets', payload);
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, 'Unable to login');
  assert.strictEqual(res.body.data.description, 'Login issue');
  assert.strictEqual(res.body.data.priority, 'HIGH');
  assert.strictEqual(res.body.data.status, 'OPEN');
  assert.strictEqual(res.body.data.category, 'TECHNICAL');
  assert.ok(res.body.data._id);
});

test('GET /api/tickets - should return 200 OK and list of tickets', async () => {
  const res = await request('GET', '/tickets');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.total >= 1);
});

test('GET /api/tickets/:id - should return 200 OK for valid ID and 404 for invalid ID', async () => {
  const all = await request('GET', '/tickets');
  const ticketId = all.body.data[0]._id;

  // Valid ID
  const validRes = await request('GET', `/tickets/${ticketId}`);
  assert.strictEqual(validRes.status, 200);
  assert.strictEqual(validRes.body.data._id, ticketId);

  // Invalid ID
  const invalidRes = await request('GET', '/tickets/999999999999999999999999');
  assert.strictEqual(invalidRes.status, 404);
  assert.strictEqual(invalidRes.body.success, false);
});

test('PUT /api/tickets/:id - should update ticket and return 200 OK', async () => {
  const all = await request('GET', '/tickets');
  const ticketId = all.body.data[0]._id;

  const updatePayload = {
    status: 'IN_PROGRESS',
    priority: 'URGENT',
  };

  const res = await request('PUT', `/tickets/${ticketId}`, updatePayload);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.status, 'IN_PROGRESS');
  assert.strictEqual(res.body.data.priority, 'URGENT');
});

test('DELETE /api/tickets/:id - should delete ticket and return 200 OK, then 404 on subsequent delete', async () => {
  // Create a temporary ticket
  const created = await request('POST', '/tickets', {
    title: 'Temporary ticket for deletion test',
    description: 'Will be deleted immediately',
    priority: 'LOW',
    status: 'OPEN',
    category: 'GENERAL',
  });
  const tempId = created.body.data._id;

  // Delete
  const delRes = await request('DELETE', `/tickets/${tempId}`);
  assert.strictEqual(delRes.status, 200);
  assert.strictEqual(delRes.body.success, true);

  // Repeat Delete -> 404
  const secondDelRes = await request('DELETE', `/tickets/${tempId}`);
  assert.strictEqual(secondDelRes.status, 404);
});
