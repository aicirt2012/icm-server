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

  reassemble(emailId, textLines) {
    this.test = "789012";
    return "Testresponse";
  }

}

export default HtmlAssembler;
