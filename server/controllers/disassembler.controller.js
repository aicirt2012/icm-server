import HtmlDisassembler from '../core/analysis/HtmlDisassembler'

exports.stripHtml = (req, res, next) => {
  try {
    let sentences = HtmlDisassembler.getInstance().stripHtml(req.body.html);
    res.status(200).send(sentences);
  } catch (err) {
    next(err);
  }
};

exports.indexAnnotations = (req, res, next) => {
  try {
    let html = HtmlDisassembler.getInstance().indexAnnotations(req.body.annotations, req.body.html);
    res.status(200).send(html);
  } catch (err) {
    next(err);
  }
};

