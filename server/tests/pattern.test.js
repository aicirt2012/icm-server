import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, {
  expect
} from 'chai';
import app from '../../index';

chai.config.includeStack = true;

after((done) => {
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe('## PATTERN API', () => {
  // USER IS THE SEBIS NG2 TEST USER LOGGED IN VIA GOOGLE OAUTH (EMAIL: sebisng2@gmail.com PASSWORD: s3b1sng2)
  let user = {
    username: 'Sebis NG2',
    password: '104027270624255049375' // Google Profile Id as password when using Google OAUTH strategy
  };

  let testPattern = 'test pattern';
  let patterns;
  let pattern;

  describe('# GET /api/auth/login', () => {
    it('should log in', (done) => {
      request(app)
        .post('/api/auth/login')
        .send({
          username: user.username,
          password: user.password
        })
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

  describe('# POST /api/pattern', () => {
    it('should create custom pattern', (done) => {
      request(app)
        .post(`/api/pattern`)
        .set('Authorization', 'JWT ' + user.token)
        .send({
          pattern: testPattern
        })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('object');
          expect(res.body.pattern).to.equal(testPattern);
          pattern = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/pattern', () => {
    it('should get all patterns for user or default', (done) => {
      request(app)
        .get(`/api/pattern`)
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          patterns = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/pattern/:patternId', () => {
    it('should get single pattern', (done) => {
      request(app)
        .get(`/api/pattern/${pattern._id}`)
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('object');
          expect(res.body.pattern).to.equal(testPattern);
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/pattern/:patternId', () => {
    it('should update a single pattern', (done) => {
      request(app)
        .put(`/api/pattern/${pattern._id}`)
        .set('Authorization', 'JWT ' + user.token)
        .send({
          pattern: 'new pattern'
        })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('object');
          expect(res.body.pattern).to.equal('new pattern');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/pattern/:patternId', () => {
    it('should delete a single pattern', (done) => {
      request(app)
        .delete(`/api/pattern/${pattern._id}`)
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('object');
          done();
        })
        .catch(done);
    });
  });

});
