import config from '../../../config/env';
import request from 'request-promise'

class NERService {

  static recognizeEntitiesInHtml(emailId, htmlSource, patterns) {

    let options = {
      method: 'POST',
      uri: config.analyticsConnectionUrl + '/recognize/html',
      body: {
        emailId: emailId,
        htmlSource: htmlSource,
        regexPatterns:patterns
      },
      json: true
    };
    return request(options);
  }

  static recognizeEntitiesInPlainText(emailId, plainText) {
    let options = {
      method: 'POST',
      uri: config.analyticsConnectionUrl + 'recognize/text',
      body: {
        emailId: emailId,
        plainText: plainText
      },
      json: true
    };
    return request(options);
  }

}

export default NERService;
