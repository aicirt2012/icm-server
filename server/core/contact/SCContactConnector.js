import config from '../../../config/env';
import SocioCortex from './SocioCortex';
import fs from 'fs';


export default class SCContactConnector extends SocioCortex{

  constructor(userId, baseURL, email, password) {
    super(baseURL, email, password);
    this.userId = userId;
  }

  getContacts(){
    return this.get('entityTypes/11rs7h6n9ioej/entities?attributes=*&meta=lastModifiedAt')
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
    const providerContacts = JSON.parse(fs.readFileSync('./server/core/contact/sc.contact.stub.json'));
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
    map.set('Groups', '');
  
    const json = {
      provider: "SC",
      providerId: scContact.id,
      user: this.userId,
      lastModifiedAt: new Date(scContact.lastModifiedAt)
    };
    scContact.attributes.forEach(attribute=>{
      if(map.has(attribute.name) && map.get(attribute.name) !== '')
        json[map.get(attribute.name)] = attribute.values.pop();
    });
    return json;
  }
    

}
