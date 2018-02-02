import Contact from '../models/contact.model';
import SCContactConnector from '../core/contact/SCContactConnector';

/**
 * @api {get} /contacts/:id Get Contact
 * @apiDescription Returns all contact details
 * @apiName GetContact
 * @apiGroup Contacts
 * @apiSuccessExample Success-Response:
 * //TODO
 * {}
 */
exports.get = (req, res, next) => {
  Contact.findOne({user: req.user._id, _id: req.params.id}).exec()
    .then(contact => {
      res.status(200).send(contact);
    })
    .catch(err => {
      next(err);
    });
};

/**
 * @api {get} /contacts Get all Contacts
 * @apiDescription Returns a list of all contacts
 * @apiName GetContacts
 * @apiGroup Contacts
 * @apiSuccessExample Success-Response:
 * //TODO
 * {}
 */
exports.list = (req, res, next) => {
  Contact.find({user: req.user._id}, {firstName: 1, lastName: 1}).limit(100).exec()
    .then(contacts => {
      res.status(200).send(contacts);
    })
    .catch(err => {
      next(err);
    });
};


/**
 * https://code.tutsplus.com/tutorials/full-text-search-in-mongodb--cms-24835
 * @api {get} /contacts/search Search Contact
 * @apiDescription Returns a list contacts ordered by relevance
 * @apiName SearchContact
 * @apiGroup Contacts
 * @apiSuccessExample Success-Response:
 * //TODO
 * {}
 */
exports.search = (req, res, next) => {
  const query = req.query.query;
  Contact.find(
    {
      user: req.user._id,
      $text: {$search: query}
    },
    {
      score: {$meta: "textScore"},
      firstName: 1,
      lastName: 1,
      email: 1,
      businessCompany: 1,
      businessJobTitle: 1,
      groups: 1
    })
    .lean()
    .sort({score: {$meta: "textScore"}})
    .exec()
    .map(contact => {
      contact = appendSecondaryContacts(req.user, contact);
      return contact;
    }, {concurrency: 5})
    .then(contacts => {
      res.status(200).send(contacts);
    })
    .catch(err => {
      next(err);
    });
};

/**
 * @api {post} /contacts/sync Sync Contacts
 * @apiDescription Syncs all contacts
 * @apiName SyncContact
 * @apiGroup Contacts
 * @apiSuccessExample Success-Response:
 * {}
 */
exports.sync = (req, res, next) => {
  const syncedAt = new Date();
  //TODO add check if provider is configured
  //if(req.user.contactProvider.socioCortex.isEnabled)
  const p = req.user.contactProvider.socioCortex;
  console.log(req.user._id, p.baseURL, p.email, p.password);
  new SCContactConnector(req.user._id, p.baseURL, p.email, p.password)
    .getContactsStub()
    .then(providerContacts => {
      return Promise.map(providerContacts, providerContact => {
        return syncContact(providerContact, syncedAt);
      }, {concurrency: 10});
    })
    .then(() => {
      res.send({success: true});
    })
    .catch(err => {
      next(err);
    });
};

function syncContact(providerContact, syncedAt) {
  return Contact.findOne({user: providerContact.user, providerId: providerContact.providerId}).exec()
    .then(localContact => {
      if (localContact !== null) {
        const keys = Object.keys(providerContact);
        for (let i = 0; i < keys.length; i++) {
          localContact[keys[i]] = providerContact[keys[i]];
        }
      } else {
        localContact = providerContact;
      }
      const newContact = new Contact(localContact);
      newContact.syncedAt = syncedAt;
      return newContact.save();
    });
}

function appendSecondaryContacts(user, primaryContact) {
  if (!primaryContact.businessCompany && (!primaryContact.groups || primaryContact.groups.length < 1))
    return [];
  return Contact.find(
    {
      user: user._id,
      $or: [
        {businessCompany: primaryContact.businessCompany},
        {groups: {$elemMatch: {$in: primaryContact.groups}}}
      ],
      _id: {$ne: primaryContact._id}
    }, {
      firstName: 1,
      lastName: 1,
      email: 1,
      businessCompany: 1,
      groups: 1
    })
    .lean()
    .exec()
    .then(contacts => {
      // TODO move calculation, sorting and result limiting to DB query to speed up process
      contacts.forEach((contact) => {
        let relationScore = contact.groups.filter((group) => primaryContact.groups.includes(group)).length;
        relationScore += contact.businessCompany && contact.businessCompany === primaryContact.businessCompany ? 1 : 0;
        contact.relationScore = relationScore;
      });
      contacts.sort((a, b) => {
        // sort descending by relationsScore (highest score -> closest relation)
        return b.relationScore - a.relationScore;
      });
      contacts = contacts.slice(0, 10);

      primaryContact.secondaryContacts = contacts;
      return primaryContact;
    });
}
