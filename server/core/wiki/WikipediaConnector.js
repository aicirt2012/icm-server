import wikipedia from 'node-wikipedia';
import fs from 'fs';
var cheerio = require('cheerio');

class WikipediaConnector {

    constructor() {
    }

    getArticle(query) {
        return new Promise((resolve, reject) => {
            wikipedia.page.data(query, { content: true }, function(article) {
                const $ = cheerio.load(article.text['*']);               
                let fp = $('p');
                let teaser = '<p>'+fp.html()+'</p>';
                while(fp.next().get(0).name == 'p'){                
                    fp = fp.next();
                    teaser += '<p>'+fp.html()+'</p>';
                }
               // fs.writeFile('wikiParsed.html', teaser);
                resolve({
                    title: article.title,
                    teaser: teaser
                });
            }, function(err){
                reject(err);
            });
        });

    }



}

export default WikipediaConnector;
