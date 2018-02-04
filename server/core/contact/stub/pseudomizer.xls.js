
const fs = require('fs');
const Excel = require('exceljs');
const crypto = require('crypto');
const sha256 = x => crypto.createHash('sha1').update(x, 'utf8').digest('hex');

const inputCrawlerDir = 'crawler.data.json';
const inputContactsDir = '../../../../../Kontakt.xlsx'; // only *.xlsx files
const outputDir = 'sc.contact.stub.contacts.xlsx';


const headers = new Set(['Kontakt', 'Title', 'First Name', 'Last Name', 'Birthday', 'E-Mail', 'E-Mail 2', 'Url', 'Web Page', 'LinkedIn URL', 'Home Country', 'Home State', 'Home Street', 'Home Zip Code', 'Home City', 'Telephone Home', 'Telephone Mobile', 'Fax Home', 'Company', 'Business Country', 'Business State', 'Business Zip Code', 'Business City', 'Business Street', 'Telephone Business', 'Telephone Assistant', 'Fax Business', 'Department', 'Job Title', 'Groups']);
const map = new Map(); //<colNr, header>

if(!fs.existsSync(inputCrawlerDir))
  console.log('Input Crawler file not found!')
const crawlerJson = JSON.parse(fs.readFileSync(inputCrawlerDir));

if(!fs.existsSync(inputContactsDir))
  console.log('Input Contacts file not found!')

let workbook = new Excel.Workbook();
workbook.xlsx.readFile(inputContactsDir)
    .then(()=> {
        var worksheet = workbook.getWorksheet(1);
        return worksheet.eachRow((row, rowNumber)=>{
          if(rowNumber == 1){
            row.values.forEach((header, i) => {
              if(headers.has(header))
                map.set(i, header);
            });       
          }else{
            //console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
            const crawlerContact = crawlerJson[rowNumber-2];
            row.values.forEach((value, i) => {
              let newValue = null;
              if(map.has(i)){
                if(value != null){
                  const field = map.get(i);
                  //console.log(field, value)
                  if(field == 'Kontakt'){
                    console.log(row.values[1])
                    let title = "";
                    Array.from(map.keys()).forEach(key=>{
                      if(map.get(key) == 'Title' && row.values[key])
                        title = row.values[key] + " ";
                    });                    
                    newValue = title + crawlerContact.name+" "+crawlerContact.surname;
                  }else if(field == 'Title'){
                    newValue = value;
                  }else if(field == 'First Name'){
                    newValue = crawlerContact.name;
                  }else if(field == 'Last Name'){
                    newValue = crawlerContact.surname;
                  }else if(field == 'Birthday'){
                    newValue = 'anonymized value';
                  }else if(field == 'E-Mail'){
                    newValue = crawlerContact.email;
                  }else if(field == 'E-Mail 2'){
                    newValue = crawlerContact.email.replace('@','2@');
                  }else if(field == 'Url'){
                    newValue = 'anonymized value';
                  }else if(field == 'Web Page'){
                    newValue = 'anonymized value';
                  }else if(field == 'LinkedIn URL'){
                    newValue = 'anonymized value';
                  }else if(field == 'Home Country'){
                    newValue = value;
                  }else if(field == 'Home State'){
                    newValue = value;
                  }else if(field == 'Home Street'){
                    newValue = 'anonymized value';
                  }else if(field == 'Home Zip Code'){
                    newValue = 'anonymized value';
                  }else if(field == 'Home City'){
                    newValue = 'anonymized value';
                  }else if(field == 'Telephone Home'){
                    newValue = 'anonymized value';
                  }else if(field == 'Telephone Mobile'){
                    newValue = 'anonymized value';
                  }else if(field == 'Fax Home'){
                    newValue = 'anonymized value';
                  }else if(field == 'Company'){
                    newValue = 'anonymized value';
                  }else if(field == 'Business Country'){
                    newValue = 'anonymized value';
                  }else if(field == 'Business State'){
                    newValue = 'anonymized value';
                  }else if(field == 'Business Zip Code'){
                    newValue = 'anonymized value';
                  }else if(field == 'Business City'){
                    newValue = 'anonymized value';
                  }else if(field == 'Business Street'){
                    newValue = 'anonymized value';
                  }else if(field == 'Telephone Business'){
                    newValue = 'anonymized value';
                  }else if(field == 'Telephone Assistant'){
                    newValue = 'anonymized value';
                  }else if(field == 'Fax Business'){
                    newValue = 'anonymized value';
                  }else if(field == 'Department'){
                    newValue = 'anonymized value';
                  }else if(field == 'Job Title'){
                    newValue = 'anonymized value';
                  }else if(field == 'Groups'){
                    newValue = value;
                  }                  
                }  
              }
              row.getCell(i).value = newValue;                            
            }); 
          }          
        });
    })
    .then(()=>{
      workbook.xlsx.writeFile(outputDir)   
    })
    .then(()=>{
      console.log('Pseudomizer finished!')
    })
    .catch(err=>{
      console.log(err);
    })



  