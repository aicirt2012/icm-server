import Contact from '../models/contact.model';
import SCContactConnector from '../core/contact/SCContactConnector';
import fs from 'fs';

exports.list = (req, res, next) => {  
  Contact.find({user:req.user._id})
    .then(contacts => { 
      res.status(200).send(contacts);
    })

    .catch(err=>{      
      next(err);
    });
}

exports.sync = (req, res, next) => { 
  const syncDate = new Date(); 
  
  SCContactConnector.getContacts()
  .then(contacts=>{
    return Promise.each(contacts, contact=>{
      return syncContact(req.user._id, contact, syncDate);
    });
  })

  /*
  Promise.resolve()
  .then(()=>{
    const contacts = JSON.parse(fs.readFileSync('./server/core/contact/sc.contact.stub.json'));
    return Promise.each(contacts, contact=>{
      return syncContact(req.user._id, contact, syncDate);
    });
  })*/
  .then(()=>{
    res.send({success:true});
  })
  .catch(err=>{
    next(err);
  });
}

function syncContact(userId, contact, syncDate){  
  return Contact.findOne({user:userId, providerId: contact.id}).exec()
    .then(persistedContact=>{
      const providerContact = convert2MongoObject(contact, userId)
      if(persistedContact !== null){
        const keys = Object.keys(providerContact);
        for(let i=0; i<keys.length; i++){
          persistedContact[keys[i]] = providerContact[keys[i]];
        }      
      }else{
        persistedContact = providerContact;
      }
      const newContact = new Contact(persistedContact);
      newContact.syncAt = syncDate;
      return newContact.save();  
    });
}


function convert2MongoObject(contact, userId){

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
    providerId: contact.id,
    user: userId,
    lastModifiedAt: new Date(contact.lastModifiedAt)
  };
  contact.attributes.forEach(attribute=>{
    if(map.has(attribute.name) && map.get(attribute.name) !== '')
      json[map.get(attribute.name)] = attribute.values.pop();
  });
  console.log(json);
  return json;
}



