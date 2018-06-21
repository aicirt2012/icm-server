import NERConnector from "./ner.connector";
import Pattern from "../../models/pattern.model";

class NERService {

  nerConnector = new NERConnector();

  async extractNamedEntities(email) {
    // get all patterns for current user
    const patterns = await Pattern.find({user: email.user});
    // transform patterns into the DTOs that the NER expects
    let patternDTOs = [];
    patterns.forEach(pattern => patternDTOs.push({
      label: pattern.pattern,
      isRegex: pattern.isRegex
    }));
    // do the actual ner service calls and return result
    let namedEntities;
    if (email.html)
      namedEntities = await this.nerConnector.recognizeEntitiesInHtml(email._id, email.html, email.subject, patternDTOs).annotations;
    else
      namedEntities = await this.nerConnector.recognizeEntitiesInPlainText(email._id, email.text, email.subject, patternDTOs).annotations;

    return namedEntities ? namedEntities.annotations : [];
  }

  recognizeEntitiesInHtml(emailId, bodySource, subjectSource, patterns) {
    return this.nerConnector.recognizeEntitiesInHtml(emailId, bodySource, subjectSource, patterns);
  }

  recognizeEntitiesInPlainText(emailId, bodySource, subjectSource, patterns) {
    return this.nerConnector.recognizeEntitiesInPlainText(emailId, bodySource, subjectSource, patterns);
  }

}

export default NERService;
