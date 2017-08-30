import config from '../../../config/env';
import fetch from 'node-fetch';

export default class SocioCortex {


  static get(url, params, body){
    console.log('get')
    return SocioCortex.generateRequest('GET', url, params, body);
  }

  /*
  post(url, params, body){
    return generateRequest('POST', url, params, body);
  }

  put(url, params, body){
    return generateRequest('PUT', url, params, body);
  }

  delete(url, params, body){
    return generateRequest('DELETE', url, params, body);
  }
*/

  static generateRequest(method, url, params, body) {
    console.log('generate reuest')
    let baseURL = 'https://wwwmatthes.in.tum.de/api/v1/';
    let email = '';
    let password = '';

    url = baseURL+url;
    const options = {
      method: method,
     // body: JSON.stringify(body),
      headers: SocioCortex.generateHeader(email, password)
    };
    console.log('gen request2')
    console.log(url,options)
    return fetch(url, options).then(res => res.json());
  }

  static generateHeader(email, password){
    console.log('generate header')
    return {
      'content-type': 'application/json',
      'Authorization': 'Basic '+new Buffer(email+':'+password).toString('base64')
    };
  }

}


