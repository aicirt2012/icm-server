
const fs = require('fs');
const fetch = require('node-fetch');
const Promise = require('bluebird');
const outputDir = 'crawler.data.json';

const map = new Map();

function crawlContacts(){
  return fetch('https://uinames.com/api/?region=germany&amount=500&ext')
    .then(res=> {
        return res.json();
    }).then(contacts=> {
      contacts.forEach(c => {
        map.set(c.name+c.surname, c);
      });
      console.log(map.size + ' unique contacts crawled!');
      if(map.size<5000){
        return crawlContacts();
      }else{
        const json = [];
        for (let v of map.values())
          json.push(v);        
        fs.writeFileSync(outputDir, JSON.stringify(json, null, 2));
        console.log('Crawler finished!')
        return Promise.resolve();
      }
    });
}

crawlContacts();



