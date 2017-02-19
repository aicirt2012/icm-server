import LingueeConnector from '../core/translation/LingueeConnector';

function translate(req, res) {
  let word = req.query.word;
  if (word == undefined)
      res.status(400).send('Param word missing!');

  new LingueeConnector().translate(word)
      .then((translation)=> {
          res.status(200).send(translation);
      })
      .catch((err) => {
          res.status(500).send(err);
      });
}


export default {
  translate
};
