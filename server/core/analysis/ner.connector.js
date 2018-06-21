import config from '../../../config/env';
import fetch from 'node-fetch';

class NERConnector {

  async recognizeEntitiesInHtml(emailId, bodySource, subjectSource, patterns) {
    const url = config.analyticsConnectionUrl + '/recognize/html';
    const options = {
      method: 'POST',
      body: JSON.stringify({
        emailId: emailId,
        bodySource: bodySource,
        subjectSource: subjectSource,
        patterns: patterns
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const response = await fetch(url, options);
    return response.json();
  }

  async recognizeEntitiesInPlainText(emailId, bodySource, subjectSource, patterns) {
    const url = config.analyticsConnectionUrl + 'recognize/text';
    const options = {
      method: 'POST',
      body: JSON.stringify({
        emailId: emailId,
        bodySource: bodySource,
        subjectSource: subjectSource,
        patterns: patterns
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const response = await fetch(url, options);
    return response.json();
  }

}

export default NERConnector;
