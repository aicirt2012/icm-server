const TRELLO = 'trello';
const SOCIOCORTEX = 'sociocortex';

const PERSON = 'PERSON';
const ORGANIZATION = 'ORGANIZATION';
const DATE = 'DATE';
const TASK_TITLE = 'TASK_TITLE';

const SUGGESTED = 'suggested';
const LINKED = 'linked';

const BODY = 'BODY';
const SUBJECT = 'SUBJECT';

const HUMAN_TASK = 'humantasks';
const DUAL_TASK = 'dualtasks';

const ENABLED = 'ENABLED';
const ACTIVE = 'ACTIVE';
const COMPLETED = 'COMPLETED';
const TERMINATED = 'TERMINATED';

export default {
  taskProviders: {
    trello: TRELLO,
    sociocortex: SOCIOCORTEX
  },
  nerTypes: {
    person: PERSON,
    organization: ORGANIZATION,
    date: DATE,
    taskTitle: TASK_TITLE
  },
  taskTypes: {
    suggested: SUGGESTED,
    linked: LINKED
  },
  textOrigins: {
    body: BODY,
    subject: SUBJECT
  },
  sociocortexTaskTypes: {
    human: HUMAN_TASK,
    dual: DUAL_TASK,
  },
  sociocortexTaskStates: {
    enabled: ENABLED,
    active: ACTIVE,
    completed: COMPLETED,
    terminated: TERMINATED
  }
}
