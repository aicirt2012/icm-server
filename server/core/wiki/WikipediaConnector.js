import wikipedia from 'node-wikipedia';
import fs from 'fs';
var cheerio = require('cheerio');

class WikipediaConnector {

    constructor() {
    }

    getArticle(query) {
        return new Promise((resolve, reject) => {
            wikipedia.page.data(query, { content: true }, function(article) {
               // console.log(article.text);
               // fs.writeFile('wiki.html', article.text['*']);
                let teaser = '';
                const $ = cheerio.load(article.text['*']);
                let fp = $('p');
                console.error(fp.html())
                teaser += fp.html();
                while(fp.next().tagName == 'p'){
                    fp = fp.next();
                    teaser += fp.html();
                }
                fs.writeFile('wikiParsed.html', teaser);
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
