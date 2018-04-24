
const fs = require('fs');
const crypto = require('crypto');
const sha256 = x => crypto.createHash('sha1').update(x, 'utf8').digest('hex');

const inputCrawlerDir = 'crawler.data.json';
const inputContactsDir = '../../../../../contacts_restapi.json';
const outputDir = 'sc.contact.stub.pseudo.json';

if(!fs.existsSync(inputCrawlerDir))
  console.log('Input Crawler file not found!')
const crawlerJson = JSON.parse(fs.readFileSync(inputCrawlerDir));

if(!fs.existsSync(inputContactsDir))
  console.log('Input Contacts file not found!')
const contactsJson = JSON.parse(fs.readFileSync(inputContactsDir));

contactsJson.forEach((contact, idx) => {
  const c = crawlerJson[idx];
  contact.name = c.name + ' ' + c.surname;
  contact.id = sha256(contact.id);
  if(contact.href)
    delete contact.href;
  let birthdayIdx = null;
  contact.attributes.forEach((attribute,idx)=>{
    if(attribute.href)
      delete attribute.href;
    if(attribute.id)
      delete attribute.id;  
    const pValues = [];
    attribute.values.forEach(value=>{   
      if(value != null && !value.toString().startsWith('['))
        pValues.push(sha256(value));
    });
    attribute.values = pValues;
    if(attribute.name == 'Birthday')
      birthdayIdx = idx;
    if(attribute.values.length>0){
      if(attribute.name == 'First Name')
        attribute.values = [c.name];
      if(attribute.name == 'Last Name')
        attribute.values = [c.surname];
      if(attribute.name == 'E-Mail')
        attribute.values = [c.email];
      if(attribute.name == 'Telephone Business')
        attribute.values = [c.phone];
    }
  });
  if(birthdayIdx)
    delete contact.attributes[birthdayIdx];
});

fs.writeFileSync(outputDir, JSON.stringify(contactsJson, null, 2));
console.log('Pseudomizer finished!')
