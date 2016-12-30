import wikipedia from 'node-wikipedia';

class WikipediaConnector {

    constructor() {
    }

    getArticle(query) {
        return new Promise((resolve, reject) => {
            wikipedia.page.data(query, { content: true }, function(article) {
                resolve(article);
            }, function(err){
                reject(err);
            });
        });
    }



}

export default WikipediaConnector;
