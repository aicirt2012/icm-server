import tokenizeHtml from 'tokenize-htmltext';

class HtmlDisassembler {

  static instance = undefined;

  static getInstance() {
    if (!HtmlDisassembler.instance) {
      HtmlDisassembler.instance = new HtmlDisassembler();
    }
    return HtmlDisassembler.instance;
  }

  disassemble(htmlSource) {
    return tokenizeHtml(htmlSource);
  }

  stripHtml(htmlSource) {
    let tokenizedEmail = this.disassemble(htmlSource);
    let sentences = [];
    for (let i = 0; i < tokenizedEmail.length; i++) {
      sentences.push(tokenizedEmail[i].value);
    }
    return sentences;
  }

  indexAnnotations(annotations, htmlSource) {
    let disassembledEmail = this.disassemble(htmlSource);
    for (let i = 0; i < annotations.length; i++) {
      let annotation = annotations[i];
      for (let j = 0; j < disassembledEmail.length; j++) {
        let emailTextLine = disassembledEmail[j];
        let index = emailTextLine.value.indexOf(annotation.value);
        if (index > -1) {
          index += emailTextLine.index;
          if (!annotation.occurences) {
            annotation.occurences = [];
            annotation.offset = annotation.value.length;
          }
          annotation.occurences.push({
            index: index,
            debug_context: emailTextLine.value // TODO only for development purposes
          })
        }
      }
    }
    return annotations;
  }

}

export default HtmlDisassembler;
