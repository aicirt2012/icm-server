import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import app from '../../index';

chai.config.includeStack = true;

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe('## User APIs', () => {
  let user = {
    username: 'test',
    password: '123456',
    email: 'test@test.de'
  };

  describe('# POST /api/users', () => {
    it('should create a new user', (done) => {
      request(app)
        .post('/api/users')
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal(user.username);
          user._id = res.body._id;
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /api/auth/login', () => {
    it('should log in', (done) => {
      request(app)
        .post('/api/auth/login')
        .send({username:user.username, password: user.password})
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('object');
          expect(res.body.token).to.be.an('string');
          user.token = res.body.token;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/users/:userId', () => {
    it('should get user details', (done) => {
      request(app)
        .get(`/api/users/${user._id}`)
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal(user.username);
          done();
        })
        .catch(done);
    });

    it('should report error with message - Not found, when user does not exists', (done) => {
      request(app)
        .get('/api/users/5256c457c71d7b3ba044c73a')
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/users/:userId', () => {
    it('should update user details', (done) => {
      user.username = 'KK';
      request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', 'JWT ' + user.token)
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal('KK');
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/users/', () => {
    it('should get all users', (done) => {
      request(app)
        .get('/api/users')
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/users/', () => {
    it('should delete user', (done) => {
      request(app)
        .delete(`/api/users/${user._id}`)
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal('KK');
          done();
        })
        .catch(done);
    });
  });
});
