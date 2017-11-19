import HtmlDisassembler from '../core/analysis/HtmlDisassembler'

/**
 * @api {post} /disassembler/html/strip Strip HTML
 * @apiDescription Strips all html tags from an HTML source text leaving only plain text. Line breaks are kept intact.
 * @apiName StripHtml
 * @apiGroup Disassembler
 * @apiParam {String} html The HTML source to process
 * @apiSuccessExample Success-Response:
 *    [
 *      "text line 1",
 *      "text line 2",
 *      "text line 3"
 *    ]
 */
exports.stripHtml = (req, res, next) => {
  try {
    let sentences = HtmlDisassembler.getInstance().stripHtml(req.body.html);
    res.status(200).send(sentences);
  } catch (err) {
    next(err);
  }
};

/**
 * @api {post} /disassembler/annotations/index Index Annotations
 * @apiDescription Indexes all given annotations and outputs the index of each occurrence in the given HTML source
 * @apiName IndexAnnotations
 * @apiGroup Disassembler
 * @apiParam {Object[]} annotations Objects containing the plain text of the annotation in a 'value' field
 * @apiParam {String} html The HTML source to process
 * @apiSuccessExample Success-Response:
 * [
 *     {
 *         "value": "Sunday, November 12, 2017",
 *         "type": "DATE",
 *         "occurences": [
 *            2643
 *         ],
 *         "occurence_context": [
 *            "Sunday, November 12, 2017 11:39 AM (Germany Time)"
 *         ],
 *         "offset": 25
 *     }
 * ]
 */
exports.indexAnnotations = (req, res, next) => {
  try {
    let html = HtmlDisassembler.getInstance().indexAnnotations(req.body.annotations, req.body.html);
    res.status(200).send(html);
  } catch (err) {
    next(err);
  }
};

