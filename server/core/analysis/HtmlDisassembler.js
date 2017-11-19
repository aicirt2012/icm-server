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
    let indexedAnnotations = [];
    for (let i = 0; i < annotations.length; i++) {
      let annotation = annotations[i];
      for (let j = 0; j < disassembledEmail.length; j++) {
        let emailTextLine = disassembledEmail[j];
        let index = emailTextLine.value.indexOf(annotation.value);
        if (index > -1) {
          index += emailTextLine.index;
          indexedAnnotations.push({
            value: annotation.value,
            type: annotation.type,
            index: index,
            offset: annotation.value.length,
            debug_context: emailTextLine.value // TODO only for development purposes
          });
        }
      }
    }
    return indexedAnnotations;
  }

}

export default HtmlDisassembler;
