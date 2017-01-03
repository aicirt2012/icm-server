import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, {
  expect
} from 'chai';
import app from '../../index';
import config from '../../config/env';

chai.config.includeStack = true;

after((done) => {
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

/*
 * IMPORTANT: BEFORE TESTING LOGIN ONCE WITH THE SEBIS NG2 USER AND CONNECT * TO GMAIL
 * DEFAULT PROVIDER: TRELLO
 */
describe('## EMAIL API (IMAP)', () => {
  // USER IS THE SEBIS NG2 TEST USER LOGGED IN VIA GOOGLE OAUTH (EMAIL: sebisng2@gmail.com PASSWORD: s3b1sng2)
  let user = {
    username: 'Sebis NG2',
    password: '104027270624255049375', // Google Profile Id as password when using Google OAUTH strategy
    email: config.email
  };

  let emails;
  let email;

  describe('# POST /api/auth/login', () => {
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

  describe('# GET /api/email/init', () => {
    it('should get boxes and initial imap status', (done) => {
      request(app)
        .get(`/api/email/init`)
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          user.boxList = res.body;
          done();
        })
        .catch(done);
    }).timeout(15000);
  });

  describe('# POST /api/email/sync', () => {
    it('should sync all boxes with imap', (done) => {
      request(app)
        .post(`/api/email/sync`)
        .set('Authorization', 'JWT ' + user.token)
        .send()
        .expect(httpStatus.OK)
        .then((res) => {
          done();
        })
        .catch(done);
    }).timeout(15000);
  });

  describe('# GET /api/email', () => {
    it('should get all mails from mongoDB', (done) => {
      request(app)
        .get(`/api/email?box=${user.boxList[0].name}`)
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          emails = res.body.docs;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/email/search', () => {
    it('should search mails from mongoDB', (done) => {
      request(app)
        .get(`/api/email/search?q=Chrome`)
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.docs).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/email/single/:emailId', () => {
    it('should get single mail from mongoDB', (done) => {
      request(app)
        .get(`/api/email/single/${emails[0]._id}`)
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('object');
          email = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /api/email/addBox', () => {
    it('should add a box to the imap account', (done) => {
      request(app)
        .post(`/api/email/addBox`)
        .set('Authorization', 'JWT ' + user.token)
        .send({
          boxName: 'NewTestBox'
        })
        .expect(httpStatus.OK)
        .then((res) => {
          done();
        })
        .catch(done);
    }).timeout(15000);
  });

  describe('# POST /api/email/renameBox', () => {
    it('should rename a box in the imap account', (done) => {
      request(app)
        .post(`/api/email/renameBox`)
        .set('Authorization', 'JWT ' + user.token)
        .send({
          oldBoxName: 'NewTestBox',
          newBoxName: 'NewNewTestBox'
        })
        .expect(httpStatus.OK)
        .then((res) => {
          done();
        })
        .catch(done);
    }).timeout(15000);
  });

  describe('# POST /api/email/delBox', () => {
    it('should delete the added box from the imap account', (done) => {
      request(app)
        .post(`/api/email/delBox`)
        .set('Authorization', 'JWT ' + user.token)
        .send({
          boxName: 'NewNewTestBox'
        })
        .expect(httpStatus.OK)
        .then((res) => {
          done();
        })
        .catch(done);
    }).timeout(15000);
  });

  describe('# POST /api/email/send', () => {
    it('should send an email via smtp', (done) => {
      request(app)
        .post(`/api/email/send`)
        .set('Authorization', 'JWT ' + user.token)
        .send({
          "from": "test@test.de",
          "to": "sebisng2@gmail.com",
          "subject": "Running mocha tests",
          "text": "Sorry 'bout that",
          "html": "<b>Sorry 'bout that</b>"
        })
        .expect(httpStatus.OK)
        .then((res) => {
          done();
        })
        .catch(done);
    }).timeout(15000);
  });

  // NOTE: This test will mess up your training data set for the classifier. Please comment out if not wanted.
  describe('# POST /api/task/email/:emailId/addTask', () => {
    it('should create single task related to an email', (done) => {
      request(app)
        .get(`/api/task/boards`)
        .set('Authorization', 'JWT ' + user.token)
        .expect(httpStatus.OK)
        .then((result) => {
          request(app)
            .post(`/api/task/email/${email._id}/addTask`)
            .set('Authorization', 'JWT ' + user.token)
            .send({
              name: 'emailTestCard',
              idList: result.body[0].lists[0].id,
              sentences: email.sentences,
              sentenceId: email.sentences[0].id
            })
            .expect(httpStatus.OK)
            .then((res) => {
              expect(res.body).to.be.an('object');
              expect(res.body.name).to.equal('emailTestCard');
              done();
            })
        })
        .catch(done);
    });
  });

});
