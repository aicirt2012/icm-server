class SociocortexConnector {

  config = {
    baseURL: 'http://192.168.178.20:8084/api/v1',
    // baseURL: 'http://localhost:8084/api/v1',
    user: 'mustermann@test.sc'
  };

  constructor(email) {
    this.user = email;
  }



}

export default SociocortexConnector;
