import Contact from '../models/contact.model';

function list(req, res, next) {  
  Contact.find({user:req.user._id})
    .then(contacts => { 
      res.status(200).send(contacts);
    })
    .catch(err=>{      
      res.status(500).send(err);
    });
}

function sync(req, res, next) {  
  req.user.sociocortex
}

export default {
  list
};
