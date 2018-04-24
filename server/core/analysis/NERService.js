import config from '../../../config/env';
import request from 'request-promise'

class NERService {

  static recognizeEntitiesInHtml(emailId, bodySource,subjectSource, patterns) {

    let options = {
      method: 'POST',
      uri: config.analyticsConnectionUrl + '/recognize/html',
      body: {
        emailId: emailId,
        bodySource: bodySource,
        subjectSource:subjectSource,
        patterns:patterns
      },
      json: true
    };
    return request(options);
  }

  static recognizeEntitiesInPlainText(emailId, bodySource,subjectSource, patterns) {
    let options = {
      method: 'POST',
      uri: config.analyticsConnectionUrl + 'recognize/text',
      body: {
        emailId: emailId,
        bodySource: bodySource,
        subjectSource:subjectSource,
        patterns:patterns
      },
      json: true
    };
    return request(options);
  }

}

export default NERService;
