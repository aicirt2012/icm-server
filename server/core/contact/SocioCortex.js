import config from '../../../config/env';
import fetch from 'node-fetch';

export default class SocioCortex {

  constructor(baseURL, email, password) {
    this.baseURL = baseURL;
    this.email = email;
    this.password = password;
  }

  get(url, params, body){
    console.log('get')
    return this.generateRequest('GET', url, params, body);
  }

  /*
  post(url, params, body){
    return this.generateRequest('POST', url, params, body);
  }

  put(url, params, body){
    return this.generateRequest('PUT', url, params, body);
  }

  delete(url, params, body){
    return this.generateRequest('DELETE', url, params, body);
  }
*/

  generateRequest(method, url, params, body) {
    console.log('generate reuest')
    let baseURL = 'https://wwwmatthes.in.tum.de/api/v1/';
    let email = '';
    let password = '';

    url = baseURL+url;
    const options = {
      method: method,
     // body: JSON.stringify(body),
      headers: this.generateHeader(email, password)
    };
    console.log('gen request2')
    console.log(url,options)
    return fetch(url, options).then(res => res.json());
  }

  generateHeader(email, password){
    console.log('generate header')
    return {
      'content-type': 'application/json',
      'Authorization': 'Basic '+new Buffer(email+':'+password).toString('base64')
    };
  }

}


