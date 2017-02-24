import wikipedia from 'node-wikipedia';
import fs from 'fs';
var cheerio = require('cheerio');

class WikipediaConnector {

    constructor() {
    }

    getArticle(query) {
        return new Promise((resolve, reject) => {
            wikipedia.page.data(query, { content: true }, function(article) {
                let $ = cheerio.load(article.text['*']);   

                // find relevant teaser        
                let fp = $('p');
                let teaser = '<p>'+fp.html()+'</p>';
                while(fp.next().get(0).name == 'p'){                
                    fp = fp.next();
                    teaser += '<p>'+fp.html()+'</p>';
                }
                teaser = teaser.replace(/<a/g,'<span class="wiki-link"').replace(/a>/g,'span>');
            
                // remove references
                $ = cheerio.load(teaser);  
                $('.reference').remove(); 
                $('.update').remove(); 
                $('.noprint').remove();        
                $('a').removeAttr('href');               
                teaser = $.html();

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
