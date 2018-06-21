import NERConnector from "./ner.connector";
import Pattern from "../../models/pattern.model";

class NERService {

  constructor() {
    this._connector = new NERConnector();
  }

  async extractNamedEntities(email) {
    let namedEntities;
    const patternDTOs = await getPatternDTOs(email.user);
    if (email.html)
      namedEntities = await this._connector.recognizeEntitiesInHtml(email._id, email.html, email.subject, patternDTOs);
    else
      namedEntities = await this._connector.recognizeEntitiesInPlainText(email._id, email.text, email.subject, patternDTOs);
    return namedEntities ? namedEntities.annotations : [];
  }

  recognizeEntitiesInHtml(emailId, bodySource, subjectSource, patterns) {
    return this._connector.recognizeEntitiesInHtml(emailId, bodySource, subjectSource, patterns);
  }

  recognizeEntitiesInPlainText(emailId, bodySource, subjectSource, patterns) {
    return this._connector.recognizeEntitiesInPlainText(emailId, bodySource, subjectSource, patterns);
  }

}

async function getPatternDTOs(userId) {
  // get all patterns for current user
  const patterns = await Pattern.find({user: userId});
  // transform patterns into the DTOs that the NER expects
  const patternDTOs = [];
  patterns.forEach(pattern => patternDTOs.push({
    label: pattern.pattern,
    isRegex: pattern.isRegex
  }));
  return patternDTOs;
}

export default NERService;
