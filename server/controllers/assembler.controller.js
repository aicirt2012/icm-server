import HtmlAssembler from '../core/analysis/HtmlAssembler'

exports.disassemble = (req, res, next) => {
  try {
    let sentences = HtmlAssembler.getInstance().disassemble(req.body.email_id, req.body.html);
    res.status(200).send(sentences);
  } catch (err) {
    next(err);
  }
};

exports.reassemble = (req, res, next) => {
  try {
    let html = HtmlAssembler.getInstance().reassemble(req.body.email_id, req.body.annotations, req.body.html);
    res.status(200).send(html);
  } catch (err) {
    next(err);
  }
};

