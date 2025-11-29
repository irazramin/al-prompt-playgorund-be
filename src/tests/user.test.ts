import request from 'supertest';
import app from '../app';

describe('User Profile Endpoints', () => {
  let accessToken: string;

  beforeAll(async () => {
    // Register and login to get access token
    await request(app).post('/api/v1/auth/register').send({
      email: 'profile@example.com',
      password: 'password123',
      name: 'Profile User',
    });

    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: 'profile@example.com',
      password: 'password123',
    });

    accessToken = loginResponse.body.data.tokens.accessToken;
  });

  describe('GET /api/v1/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('email', 'profile@example.com');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      await request(app).get('/api/v1/users/profile').expect(401);
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });
  });

  describe('PUT /api/v1/users/password', () => {
    it('should change password', async () => {
      const response = await request(app)
        .put('/api/v1/users/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/users/profile', () => {
    it('should delete user account', async () => {
      const response = await request(app)
        .delete('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ password: 'newpassword123' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
