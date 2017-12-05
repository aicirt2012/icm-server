import request from 'request-promise'

class NERConnectorService {

  static runNamedEntityRecognition(emailId, plainTextBody) {
    let options = {
      method: 'POST',
      uri: 'http://localhost:8080/ner/recognize',
      body: {
        emailId: emailId,
        lines: plainTextBody
      },
      json: true
    };
    return request(options);
  }

}

export default NERConnectorService;
