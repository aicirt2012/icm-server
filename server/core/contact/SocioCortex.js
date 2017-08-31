import config from '../../../config/env';
import fetch from 'node-fetch';

export default class SocioCortex {

  constructor(baseURL, email, password) {
    this.baseURL = baseURL;
    this.email = email;
    this.password = password;
  }

  get(url, params, body){
    return this.generateRequest('GET', url, params, body);
  }

  post(url, params, body){
    //return this.generateRequest('POST', url, params, body);
  }

  put(url, params, body){
    //return this.generateRequest('PUT', url, params, body);
  }

  delete(url, params, body){
    //return this.generateRequest('DELETE', url, params, body);
  }

  generateRequest(method, url, params, body) {
    const options = {
      method: method,
     // body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        'Authorization': 'Basic '+new Buffer(this.email+':'+this.password).toString('base64')
      }
    };
    return fetch(this.baseURL+url, options)
      .then(res => res.json());
  }

}


