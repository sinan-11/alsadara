const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/server');

let mongoServer;
let token;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const User = require('../src/models/User');
  const { generateToken } = require('../src/utils/jwt');

  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    isEmailVerified: true,
  });

  userId = user._id;
  token = generateToken(userId);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (key !== 'users') {
      await collections[key].deleteMany({});
    }
  }
});

const authHeader = () => ({ Authorization: `Bearer ${token}` });

describe('Mobile Endpoints', () => {
  const testMobile = {
    imei1: '356789012345678',
    imei2: '356789012345679',
    brand: 'Samsung',
    model: 'Galaxy A56',
    variant: '8GB/256GB',
    ram: '8 GB',
    storage: '256 GB',
    color: 'Black',
    purchasePrice: 35000,
    sellingPrice: 39999,
    notes: 'New stock',
  };

  describe('POST /api/mobiles', () => {
    it('should add a mobile', async () => {
      const res = await request(app)
        .post('/api/mobiles')
        .set(authHeader())
        .send(testMobile);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mobile.imei1).toBe('356789012345678');
    });

    it('should reject duplicate IMEI', async () => {
      await request(app)
        .post('/api/mobiles')
        .set(authHeader())
        .send(testMobile);

      const res = await request(app)
        .post('/api/mobiles')
        .set(authHeader())
        .send(testMobile);

      expect(res.status).toBe(409);
    });

    it('should reject same IMEI in IMEI1 and IMEI2', async () => {
      const res = await request(app)
        .post('/api/mobiles')
        .set(authHeader())
        .send({ ...testMobile, imei2: testMobile.imei1 });

      expect(res.status).toBe(400);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/mobiles')
        .send(testMobile);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/mobiles', () => {
    it('should get mobiles with pagination', async () => {
      await request(app)
        .post('/api/mobiles')
        .set(authHeader())
        .send(testMobile);

      const res = await request(app)
        .get('/api/mobiles')
        .set(authHeader());

      expect(res.status).toBe(200);
      expect(res.body.data.mobiles.length).toBe(1);
      expect(res.body.pagination).toBeDefined();
    });

    it('should search by brand', async () => {
      await request(app)
        .post('/api/mobiles')
        .set(authHeader())
        .send(testMobile);

      const res = await request(app)
        .get('/api/mobiles?search=Samsung')
        .set(authHeader());

      expect(res.status).toBe(200);
      expect(res.body.data.mobiles.length).toBe(1);
    });

    it('should search by IMEI', async () => {
      await request(app)
        .post('/api/mobiles')
        .set(authHeader())
        .send(testMobile);

      const res = await request(app)
        .get('/api/mobiles?search=356789012345678')
        .set(authHeader());

      expect(res.status).toBe(200);
      expect(res.body.data.mobiles.length).toBe(1);
    });
  });

  describe('GET /api/mobiles/imei/:imei', () => {
    it('should get mobile by IMEI', async () => {
      await request(app)
        .post('/api/mobiles')
        .set(authHeader())
        .send(testMobile);

      const res = await request(app)
        .get('/api/mobiles/imei/356789012345678')
        .set(authHeader());

      expect(res.status).toBe(200);
      expect(res.body.data.mobile.brand).toBe('Samsung');
    });

    it('should return 404 for non-existent IMEI', async () => {
      const res = await request(app)
        .get('/api/mobiles/imei/000000000000000')
        .set(authHeader());

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/mobiles/:id', () => {
    it('should update mobile', async () => {
      const addRes = await request(app)
        .post('/api/mobiles')
        .set(authHeader())
        .send(testMobile);

      const id = addRes.body.data.mobile._id;

      const res = await request(app)
        .put(`/api/mobiles/${id}`)
        .set(authHeader())
        .send({ color: 'White' });

      expect(res.status).toBe(200);
      expect(res.body.data.mobile.color).toBe('White');
    });
  });

  describe('DELETE /api/mobiles/:id', () => {
    it('should delete mobile', async () => {
      const addRes = await request(app)
        .post('/api/mobiles')
        .set(authHeader())
        .send(testMobile);

      const id = addRes.body.data.mobile._id;

      const res = await request(app)
        .delete(`/api/mobiles/${id}`)
        .set(authHeader());

      expect(res.status).toBe(200);
    });
  });
});
