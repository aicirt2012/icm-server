import Contact from '../models/contact.model';
import SCContactConnector from '../core/contact/SCContactConnector';

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
  const syncedAt = new Date(); 
  new SCContactConnector(req.user._id, null, null, null)
    .getContacts()
    .then(providerContacts=>{
      return Promise.map(providerContacts, providerContact=>{
        return syncContact(providerContact, syncedAt);
      },{concurrency: 20});
    })
    .then(()=>{
      res.send({success:true});
    })
    .catch(err=>{
      next(err);
    });
}

function syncContact(providerContact, syncedAt){  
  return Contact.findOne({user:providerContact.user, providerId: providerContact.providerId}).exec()
    .then(localContact=>{
      if(localContact !== null){
        const keys = Object.keys(providerContact);
        for(let i=0; i<keys.length; i++){
          localContact[keys[i]] = providerContact[keys[i]];
        }      
      }else{
        localContact = providerContact;
      }
      const newContact = new Contact(localContact);
      newContact.syncedAt = syncedAt;
      return newContact.save();  
    });
}





