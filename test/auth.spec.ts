import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestModule } from './test.module';
import { TestService } from './test.service';
import * as cookieParser from 'cookie-parser';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let log: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());
    await app.init();
    log = app.get(WINSTON_MODULE_PROVIDER);

    testService = app.get(TestService);
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      await testService.delete();
    });

    it('should be reject to login caused validation request', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/login')
        .send({
          username: '',
          password: '',
        });
      log.info(response.body);
      expect(response.body.errors).toBeDefined();
      expect(response.status).toBe(400);
    });

    it('should be reject to login caused password wrong', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/login')
        .send({
          username: 'test',
          password: 'testos',
        });
      log.info(response.body);
      expect(response.body.errors).toBeDefined();
      expect(response.status).toBe(401);
    });
    it('should be able to login', async () => {
      await testService.create();
      const response = await request(app.getHttpServer())
        .post('/api/login')
        .send({
          username: 'test',
          password: 'test',
        });
      log.info(response.body);

      expect(response.body.errors).toBeUndefined();
      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.fullname).toBe('test');
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.accessToken).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });
  describe('POST /api/register', () => {
    beforeEach(async () => {
      await testService.delete();
    });

    it('should be reject caused validation request', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/register')
        .send({
          username: '',
          fullname: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
      log.info(response.body);
      expect(response.body.errors).toBeDefined();
      expect(response.status).toBe(400);
    });

    it('should be reject to register caused password not match', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/register')
        .send({
          username: 'test',
          fullname: 'test',
          email: 'test@example.com',
          password: 'test',
          confirmPassword: 'test12',
        });
      log.info(response.body);
      expect(response.body.errors.message).toBeUndefined();
      expect(response.status).toBe(400);
    });
    it('should be able to register', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/register')
        .send({
          username: 'test',
          fullname: 'test',
          email: 'test@example.com',
          password: 'test',
          confirmPassword: 'test',
        });
      log.info(response.body);
      expect(response.body.errors).toBeUndefined();
      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.fullname).toBe('test');
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.password).toBeUndefined();
    });
  });
  describe('POST /api/refreshToken', () => {
    beforeEach(async () => {
      await testService.delete();
    });

    it('should be reject caused refresh token not set', async () => {
      await testService.create();
      await request(app.getHttpServer()).post('/api/login').send({
        username: 'test',
        password: 'test',
      });
      const response = await request(app.getHttpServer())
        .post('/api/refreshToken')
        .set('Cookie', []);
      log.info(response.body);
      expect(response.body.errors).toBe('Token not valid');
      expect(response.status).toBe(401);
    });

    it('should be reject caused refresh token not valid', async () => {
      await testService.create();
      await request(app.getHttpServer()).post('/api/login').send({
        username: 'test',
        password: 'test',
      });
      const response = await request(app.getHttpServer())
        .post('/api/refreshToken')
        .set('Cookie', ['refreshToken=awokawok'])
        .send({});
      log.info(response.body);
      expect(response.body.errors).toBe('jwt malformed');
      expect(response.status).toBe(401);
    });

    it('should be able to refresh token ', async () => {
      await testService.create();
      const token = await request(app.getHttpServer()).post('/api/login').send({
        username: 'test',
        password: 'test',
      });

      const response = await request(app.getHttpServer())
        .post('/api/refreshToken')
        .set('Cookie', [...token.headers['set-cookie']]);
      log.info(response.body);
      // log.info({
      //   msg: 'woww',
      //   data: token.headers['set-cookie'][0].split(';')[0].split('=')[1],
      // });
      expect(response.body.errors).toBeUndefined();
      expect(response.body.accessToken).toBeDefined();
    });
  });

  // memory leaked??
  describe('DELETE /api/logout', () => {
    beforeEach(async () => {
      await testService.delete();
    });

    it('should be able to logout when refresh token not set', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/logout')
        .set('Cookie', []);
      log.info(response.body);
      log.info(response.headers['set-cookie']);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data).toBe(true);
      expect(response.body.success).toBe(true);
      expect(response.status).toBe(200);
    });

    it('should be able to logout', async () => {
      await testService.create();
      const token = await request(app.getHttpServer()).post('/api/login').send({
        username: 'test',
        password: 'test',
      });
      const response = await request(app.getHttpServer())
        .delete('/api/logout')
        .set('Cookie', [...token.headers['set-cookie']])
        .send({});

      log.info(response.body);
      expect(
        response.headers['set-cookie'][0].split(';')[0].split('=')[1],
      ).toBe('');
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data).toBe(true);
      expect(response.body.success).toBe(true);
      expect(response.status).toBe(200);
    });

    // it('should be able to refresh token ', async () => {
    //   await testService.create();
    //   const token = await request(app.getHttpServer()).post('/api/login').send({
    //     username: 'test',
    //     password: 'test',
    //   });

    //   const response = await request(app.getHttpServer())
    //     .post('/api/refreshToken')
    //     .set('Cookie', [...token.headers['set-cookie']]);
    //   log.info(response.body);
    //   // log.info({
    //   //   msg: 'woww',
    //   //   data: token.headers['set-cookie'][0].split(';')[0].split('=')[1],
    //   // });
    //   expect(response.body.errors).toBeUndefined();
    //   expect(response.body.accessToken).toBeDefined();
    // });
  });
});
