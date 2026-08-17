const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Auth Endpoints', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should not register with duplicate email', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should not register without required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email with correct OTP', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const User = require('../src/models/User');
      const user = await User.findOne({ email: testUser.email }).select(
        '+verificationCode'
      );

      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ email: testUser.email, code: user.verificationCode });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject invalid OTP', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ email: testUser.email, code: '000000' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with verified account', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const User = require('../src/models/User');
      const user = await User.findOne({ email: testUser.email }).select(
        '+verificationCode'
      );

      await request(app)
        .post('/api/auth/verify-email')
        .send({ email: testUser.email, code: user.verificationCode });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should not login unverified user', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(403);
    });

    it('should not login with wrong password', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const User = require('../src/models/User');
      const user = await User.findOne({ email: testUser.email }).select(
        '+verificationCode'
      );

      await request(app)
        .post('/api/auth/verify-email')
        .send({ email: testUser.email, code: user.verificationCode });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send reset code', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expect(res.status).toBe(200);
    });

    it('should return generic message for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid OTP', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      const User = require('../src/models/User');
      const user = await User.findOne({ email: testUser.email }).select(
        '+resetPasswordCode'
      );

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          email: testUser.email,
          code: user.resetPasswordCode,
          newPassword: 'newpassword123',
        });

      expect(res.status).toBe(200);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'newpassword123' });

      expect(loginRes.status).toBe(200);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
    });
  });
});
