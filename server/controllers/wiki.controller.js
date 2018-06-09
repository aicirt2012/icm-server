import WikipediaService from '../core/wiki/wikipedia.service';


exports.search = (req, res, next) => {
  let query = req.query.query;
  if(query == undefined)
    res.status(400).send('Query param missing!');
  new WikipediaService().getArticle(query)
    .then((article)=>{
      res.status(200).send(article);
    })
    .catch((err) => {
      next(err);
    });
}
