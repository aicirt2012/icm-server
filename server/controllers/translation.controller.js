import LingueeConnector from '../core/translation/LingueeConnector';

/**
 * @api {get} /translate/ Translate
 * @apiDescription Translates a word 
 * @apiName Translate
 * @apiGroup Translate
 * @apiParam {String} word word to translate
 * @apiSuccessExample Success-Response:
 * [
 *   {
 *     "source": "book",
 *     "target": [
 *       "Buch",
 *       "Heft"
 *     ]
 *   },
 *   {
 *     "source": "book",
 *     "target": [
 *       "etw.Akk buchen",
 *       "etw.Akk reservieren",
 *       "etw.Akk bestellen"
 *     ]
 *   }
 * ]
 */
exports.translate = (req, res, next) => {
  let word = req.query.word;
  if (word == undefined)
      res.status(400).send('Param word missing!');
  else{
    new LingueeConnector().translate(word)
      .then(translation=> {
        res.status(200).send(translation);
      })
      .catch(err => {
        next(err);
      });
  }
}