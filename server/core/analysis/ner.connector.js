import config from '../../../config/env';
import fetch from 'node-fetch';

class NERConnector {

  async recognizeEntitiesInHtml(emailId, bodySource, subjectSource, patterns) {
    const url = config.analyticsConnectionUrl + '/recognize/html';
    const options = {
      method: 'POST',
      body: {
        emailId: emailId,
        bodySource: bodySource,
        subjectSource: subjectSource,
        patterns: patterns
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };
    console.log("Connector: Firing request");
    const response = await fetch(url, options);
    console.log("Connector: Got a response");
    return response.json();
  }

  async recognizeEntitiesInPlainText(emailId, bodySource, subjectSource, patterns) {
    const url = config.analyticsConnectionUrl + 'recognize/text';
    const options = {
      method: 'POST',
      body: {
        emailId: emailId,
        bodySource: bodySource,
        subjectSource: subjectSource,
        patterns: patterns
      },
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const response = await fetch(url, options);
    return response.json();
  }

}

export default NERConnector;
