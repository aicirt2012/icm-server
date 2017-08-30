import Contact from '../models/contact.model';
import ContactConnector from '../core/contact/ContactConnector';

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
  ContactConnector.getContacts()
  .then(contacts=>{
    console.log('found contacts: '+contacts.length);
    res.send(contacts);
  })
  .catch(err=>{
    next(err);
  });
}
