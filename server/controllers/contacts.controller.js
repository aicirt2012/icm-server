import Contact from '../models/contact.model';
import SCContactConnector from '../core/contact/SCContactConnector';

exports.list = (req, res, next) => {  
  Contact.find({user:req.user._id}, {firstName:1, lastName:1}).limit(100).exec()
    .then(contacts => { 
      res.status(200).send(contacts);
    })
    .catch(err=>{      
      next(err);
    });
}

/**
 * https://code.tutsplus.com/tutorials/full-text-search-in-mongodb--cms-24835
 */
exports.search = (req, res, next) => {  
  const query = req.query.query;
  Contact.find({user:req.user._id, $text: {$search: query}}, {score: {$meta: "textScore"}, firstName:1, lastName:1}).sort({score: {$meta: "textScore"}}).exec()
    .then(contacts => { 
      res.status(200).send(contacts);
    })
    .catch(err=>{      
      next(err);
    });
}

exports.sync = (req, res, next) => { 
  const syncedAt = new Date(); 
  //if(req.user.contactProvider.socioCortex.isEnabled)
  const p = req.user.contactProvider.socioCortex;
  new SCContactConnector(req.user._id, p.baseURL, p.email, p.password)
    .getContacts()
    .then(providerContacts=>{
      return Promise.map(providerContacts, providerContact=>{
        return syncContact(providerContact, syncedAt);
      },{concurrency: 10});
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





