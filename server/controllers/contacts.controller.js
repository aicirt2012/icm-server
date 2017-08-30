import Contact from '../models/contact.model';
import ContactConnector from '../core/contact/ContactConnector';
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
  /*
  ContactConnector.getContacts()
  .then(contacts=>{
    return Promise.each(contacts, contact=>{
      return syncContact(contact);
    });
  })
  */
  Promise.resolve()
  .then(()=>{
    const contacts = JSON.parse(fs.readFileSync('./server/core/contact/sc.contact.stub.json'));
    return Promise.each(contacts, contact=>{
      return syncContact(req.user._id, contact);
    });
  })
  .then(()=>{
    res.send({success:true});
  })
  .catch(err=>{
    next(err);
  });
}

function syncContact(userId, contact){
  console.log({user:userId, providerId: contact.id});
  return Contact.findOne({user:userId, providerId: contact.id}).exec()
    .then(persistedContact=>{
      if(persistedContact !== null){
        console.log('exists');
        return Promise.resolve();
      }else{
        console.log('doesnt exist');
        const newContact = new Contact(convert2MongoObject(contact, userId));
        return newContact.save();
      }      
    })
}

function convert2MongoObject(contact, userId){
  const c = {
    providerId: contact.id,
    user: userId
  };
  contact.attributes.forEach(attribute=>{
    if(map.has(attribute.name) && map.get(attribute.name) !== ''){
      c[map.get(attribute.name)] = attribute.values.pop();
    }
  });
  console.log(c);
  return c;
}

const map = new Map();
map.set('Home City', 'city');
map.set('First Name', 'firstname');
map.set('Last Name', 'lastname');
map.set('Home Country', '');
map.set('Telephone Home', '');
map.set('Home Street', '');
map.set('Business Zip Code', '');
map.set('Url', '');
map.set('Telephone Assistant', '');
map.set('Telephone Mobile', '');
map.set('Title', 'title');
map.set('Fax Business', '');
map.set('Salutation', '');
map.set('Web Page', '');
map.set('Birthday', '');
map.set('Business Country', '');
map.set('Telephone Business', '');
map.set('Company', 'company');
map.set('E-Mail', 'email');
map.set('Home State', '');
map.set('Fax Home', '');
map.set('Home Zip Code', '');
map.set('E-Mail 2', '');
map.set('Business City', '');
map.set('Groups', '');
map.set('LinkedIn URL', '');
map.set('Business Street', '');
map.set('Department', '');
map.set('Business State', '');
map.set('Job Title', '');

