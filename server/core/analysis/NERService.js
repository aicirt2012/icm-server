import request from 'request-promise'

class NERService {

  static runNamedEntityRecognition(emailId, htmlSource) {
    let options = {
      method: 'POST',
      uri: 'http://localhost:8080/ner/recognize',
      body: {
        emailId: emailId,
        htmlSource: htmlSource
      },
      json: true
    };
    return request(options);
  }

}

export default NERService;
