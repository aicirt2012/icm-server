import request from 'request-promise'

class NERService {

  static recognizeEntitiesInHtml(emailId, htmlSource) {
    let options = {
      method: 'POST',
      uri: 'http://localhost:8080/ner/recognize/html',
      body: {
        emailId: emailId,
        htmlSource: htmlSource
      },
      json: true
    };
    return request(options);
  }

  static recognizeEntitiesInPlainText(emailId, plainText) {
    let options = {
      method: 'POST',
      uri: 'http://localhost:8080/ner/recognize/text',
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
