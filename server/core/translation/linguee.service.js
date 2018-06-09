var request = require('request');
var cheerio = require('cheerio');


class LingueeService {

    lang = {
      'eng' : 'english',
      'ger' : 'german',
      'fra' : 'french',
      'spa' : 'spanish',
      'chi' : 'chinese',
      'rus' : 'russian',
      'jpn' : 'japanese',
      'por' : 'portuguese',
      'ita' : 'italian',
      'dut' : 'dutch',
      'pol' : 'polish',
      'swe' : 'swedish',
      'dan' : 'danish',
      'fin' : 'finnish',
      'gre' : 'greek',
      'cze' : 'czech',
      'rum' : 'romanian',
      'hun' : 'hungarian',
      'slo' : 'slovak',
      'bul' : 'bulgarian',
      'slv' : 'slovene',
      'lit' : 'lithuanian',
      'lav' : 'latvian',
      'est' : 'estonian',
      'mlt' : 'maltese'
    };

    constructor() {
    }

    translate(word) {
      //TODO implement multiple language support, see language variable (low priority)
      return new Promise((resolve, reject) => {
        request({uri: 'http://www.linguee.com/english-german/search?source=auto&query=' + word, encoding: 'binary' }, function (err, res, body) {
          if (!err && res.statusCode == 200) {
            const $ = cheerio.load(body);
            const translation = [];

            /** Select result block .isMainTerm*/
            $('#dictionary  .exact .lemma.featured').map(function () {

              /** A word Block represents one word with different explanations
               *   source = word of search term or variations
               *   target = translated words */
              let sourceTerm = $(this).find('.line.lemma_desc .dictLink');
              const wordBlock = {
                source: sourceTerm.text(),
                sourceLanguage: LingueeService.extractLanguageFromHref(sourceTerm),
                target: []
              };
              $(this).find('.translation.featured .translation_desc .tag_trans .dictLink.featured').map(function () {
                wordBlock.target.push($(this).text());
              });
              translation.push(wordBlock);
            });
            resolve(translation);

          }else{
            reject(err);
          }
        });
      });
    }

  static extractLanguageFromHref(sourceTerm) {
    let hrefString = sourceTerm.attr("href");
    let sourceLanguage = undefined;
    if (hrefString) {
      if (hrefString.indexOf("/") > -1 && hrefString.indexOf("-") > -1 && hrefString.indexOf("/") < hrefString.indexOf("-")) {
        sourceLanguage = hrefString.substring(hrefString.indexOf("/") + 1, hrefString.indexOf("-"));
        if (sourceLanguage === "english") {
          sourceLanguage = "EN";
        } else if (sourceLanguage === "german") {
          sourceLanguage = "DE"
        }
      }
    }
    return sourceLanguage;
  }

}

export default LingueeService;
