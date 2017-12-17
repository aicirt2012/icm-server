
const fs = require('fs');
const crypto = require('crypto');
const sha256 = x => crypto.createHash('sha1').update(x, 'utf8').digest('hex');

const inputDir = '../../../../contacts_restapi.json';
const outputDir = 'sc.contact.stub.pseudo.json';
if(!fs.existsSync(inputDir))
  console.log('Input file not found!')
const json = JSON.parse(fs.readFileSync(inputDir));
json.forEach(contact => {
  contact.name = sha256(contact.name);
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
  });
  if(birthdayIdx)
    delete contact.attributes[birthdayIdx];
});

fs.writeFileSync(outputDir, JSON.stringify(json, null, 2));
console.log('Pseudomizer finished!')
