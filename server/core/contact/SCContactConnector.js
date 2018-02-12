import config from '../../../config/env';
import SocioCortex from './SocioCortex';
import fs from 'fs';
import { Promise } from 'bluebird';


export default class SCContactConnector extends SocioCortex{

  constructor(userId, baseURL, email, password) {
    super(baseURL, email, password);
    this.userId = userId;
  }

  static test(isEnabled, baseURL, email, password){    
    return new Promise((resolve, reject)=>{
      if(!isEnabled)
        resolve(true);
      else
        new SCContactConnector(null, baseURL, email, password).get('users/me') //entityTypes/11rs7h6n9ioej
          .then(()=>{
            resolve(true);
          })
          .catch(err=>{
            resolve(false);
          })
    });
    
  }

  getContacts(){
    return this.get('/entityTypes/11rs7h6n9ioej/entities?attributes=*&meta=lastModifiedAt')
      .then(providerContacts=>{
        const contacts = [];
        providerContacts.forEach(providerContact=>{
          contacts.push(this.convert2MongoObject(providerContact))
        })
        return Promise.resolve(contacts);
      });
  }

  //TODO Remove when impl is finished!
  getContactsStub(){
    const dir = './server/core/contact/stub/sc.contact.stub.dummy.json';
    //const dir = 'D:/Projekte/ICM/repos/sebis_contacts_restapi.json';
    const providerContacts = JSON.parse(fs.readFileSync(dir));
    const contacts = [];
    providerContacts.forEach(providerContact=>{
      contacts.push(this.convert2MongoObject(providerContact));
    });
    return Promise.resolve(contacts);
  }

  convert2MongoObject(scContact){
    
    const map = new Map();  
    map.set('Title', 'title');
    map.set('Salutation', '');
    map.set('First Name', 'firstName');
    map.set('Last Name', 'lastName');
    map.set('Birthday', 'birthday');
    map.set('E-Mail', 'email');
    map.set('E-Mail 2', 'email2');
    map.set('Url', 'url');
    map.set('Web Page', 'www');
    map.set('LinkedIn URL', 'linkedInUrl');  
    map.set('Home Country', 'homeCountry');
    map.set('Home State', 'homeState');
    map.set('Home Street', 'homeStreet');
    map.set('Home Zip Code', 'homeZip');
    map.set('Home City', 'homeCity');
    map.set('Telephone Home', 'homePhone');
    map.set('Telephone Mobile', 'homeMobile');
    map.set('Fax Home', 'homeFax');  
    map.set('Company', 'businessCompany');
    map.set('Business Country', 'businessCountry');
    map.set('Business State', 'businessState');
    map.set('Business Zip Code', 'businessZip');
    map.set('Business City', 'businessCity');
    map.set('Business Street', 'businessStreet');
    map.set('Telephone Business', 'businessPhone');
    map.set('Telephone Assistant', 'businessPhoneAssistant');
    map.set('Fax Business', 'businessFax');
    map.set('Department', 'businessDepartment');
    map.set('Job Title', 'businessJobTitle');  
    map.set('Groups', 'groups');
  
    const json = {
      provider: "SC",
      providerId: scContact.id,
      user: this.userId,
      lastModifiedAt: new Date(scContact.lastModifiedAt)
    };
    scContact.attributes.forEach(attribute=>{
      if(map.has(attribute.name) && map.get(attribute.name) !== ''){
        if(attribute.name == 'Groups'){
          json[map.get(attribute.name)] = attribute.values;
        }else{
          json[map.get(attribute.name)] = attribute.values.pop();
        }        
      }
    });
    return json;
  }
    

}
