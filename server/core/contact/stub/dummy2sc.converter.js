
const fs = require('fs');
const crypto = require('crypto');
const sha256 = x => crypto.createHash('sha1').update(x, 'utf8').digest('hex');

const inputDir = 'ICM_dummy_contacts.json';
const outputDir = 'sc.contact.stub.dummy.json.js';
if(!fs.existsSync(inputDir))
  console.log('Input file not found!')

const scContacts = [];
const dummyContacts = JSON.parse(fs.readFileSync(inputDir));
console.log('All dummy contacts loaded!')

dummyContacts.forEach(dummyContact => {
  const scContact = {};
  scContact.name = dummyContact['Title']+' '+dummyContact['First Name']+' '+dummyContact['Last Name'].trim();
  scContact.id = sha256(scContact.name);
  scContact.lastModifiedAt = '2017-07-25T19:02:37.000Z';
  scContact.attributes = [];
  console.log(scContact.name);
  addAttribute(scContact, 'Title', dummyContact, 'Title');
  addAttribute(scContact, 'Salutation', dummyContact, 'Salutation');
  addAttribute(scContact, 'First Name', dummyContact, 'First Name');
  addAttribute(scContact, 'Last Name', dummyContact, 'Last Name');
  addAttribute(scContact, 'Birthday', dummyContact, 'Birthday');
  addAttribute(scContact, 'E-Mail', dummyContact, 'E-Mail');
  addAttribute(scContact, 'E-Mail 2', dummyContact, 'E-Mail 2');
  addAttribute(scContact, 'Url', dummyContact, null);
  addAttribute(scContact, 'Web Page', dummyContact, 'Web Page');
  addAttribute(scContact, 'LinkedIn URL', dummyContact, 'LinkedIn URL');
  addAttribute(scContact, 'Home Country', dummyContact, 'Home Country');
  addAttribute(scContact, 'Home State', dummyContact, 'Home State');
  addAttribute(scContact, 'Home Street', dummyContact, 'Home Street');
  addAttribute(scContact, 'Home Zip Code', dummyContact, 'Home Zip Code');
  addAttribute(scContact, 'Home City', dummyContact, 'Home City');
  addAttribute(scContact, 'Telephone Home', dummyContact, 'Telephone Home');
  addAttribute(scContact, 'Telephone Mobile', dummyContact, 'Telephone Mobile');
  addAttribute(scContact, 'Fax Home', dummyContact, 'Fax Home');
  addAttribute(scContact, 'Company', dummyContact, 'Company');
  addAttribute(scContact, 'Business Country', dummyContact, 'Business Country');
  addAttribute(scContact, 'Business State', dummyContact, 'Business State');
  addAttribute(scContact, 'Business Zip Code', dummyContact, 'Business Zip Code');
  addAttribute(scContact, 'Business City', dummyContact, 'Business City');
  addAttribute(scContact, 'Business Street', dummyContact, 'Business Street');
  addAttribute(scContact, 'Telephone Business', dummyContact, 'Telephone Business');
  addAttribute(scContact, 'Telephone Assistant', dummyContact, 'Telephone Assistant');
  addAttribute(scContact, 'Fax Business', dummyContact, 'Fax Business');
  addAttribute(scContact, 'Department', dummyContact, 'Department');
  addAttribute(scContact, 'Job Title', dummyContact, 'Job Title');
  addAttribute(scContact, 'Groups', dummyContact, 'Groups');

  scContacts.push(scContact);
});

function addAttribute(scContact, scKey, dummyContact, dummyKey){

  let values = [dummyContact[dummyKey]];
  if(scKey == 'Groups'){
    values = [];
    if(dummyContact[dummyKey] != null)
      dummyContact[dummyKey].forEach(value=>{
        values.push(value);
      });
  }else if(scKey == 'Birthday'){
    /** convert from 1953/04/23 to 2017-07-25T19:02:37.000Z (ISO8601) */
    if(values != null) {
      let date = new Date(values).toISOString();
      values = [];
      values.push(date);
    }
  }
  scContact.attributes.push({
    "values": values,
    "name": scKey
  });
}



fs.writeFileSync(outputDir, JSON.stringify(scContacts, null, 2));
console.log('Converter finished!')
