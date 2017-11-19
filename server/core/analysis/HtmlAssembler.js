import tokenizeHtml from 'tokenize-htmltext';

class HtmlAssembler {

  static instance = undefined;

  static getInstance() {
    if (!HtmlAssembler.instance) {
      HtmlAssembler.instance = new HtmlAssembler();
    }
    return HtmlAssembler.instance;
  }

  disassembledEmails = {};

  disassemble(emailId, htmlSource) {
    let tokenizedEmail = tokenizeHtml(htmlSource);
    this.disassembledEmails[emailId] = tokenizedEmail;
    let sentences = [];
    for (let i = 0; i < tokenizedEmail.length; i++) {
      sentences.push(tokenizedEmail[i].value);
    }
    return sentences;
  }

  reassemble(emailId, annotations, htmlSource) {
    if (!(emailId in this.disassembledEmails)) {
      this.disassemble(emailId, htmlSource);
    }
    let tokenizedEmail = this.disassembledEmails[emailId];
    let indexedAnnotations = [];
    for (let i = 0; i < annotations.length; i++) {
      let annotation = annotations[i];
      for (let j = 0; j < tokenizedEmail.length; j++) {
        let emailToken = tokenizedEmail[j];
        let index = emailToken.value.indexOf(annotation.value);
        if (index > -1) {
          index += emailToken.index;
          indexedAnnotations.push({
            value: annotation.value,
            type: annotation.type,
            index: index,
            offset: annotation.value.length,
            debug_context: emailToken.value // TODO only for development purposes
          });
        }
      }
    }
    return indexedAnnotations;
  }

}

export default HtmlAssembler;
