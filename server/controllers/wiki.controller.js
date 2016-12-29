import WikipediaConnector from '../core/wiki/WikipediaConnector';


function search(req, res) {
  let query = req.query.query;
  if(query == undefined)
      res.status(400).send('Query param missing!');
  new WikipediaConnector().getArticle(query)
      .then((article)=>{
          res.status(200).send(article);
      })
      .catch((err) => {
          res.status(500).send(err);
      });
}


export default {
  search
};
