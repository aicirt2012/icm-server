import TrelloLegacyConnector from './TrelloLegacyConnector';
import SociocortexConnector from './SociocortexConnector';
import Constants from '../../../config/constants';


/* TASK HELPER */
export function createTaskConnector(provider, user) {
  switch (provider) {
    case Constants.taskProviders.trello:
      return new TrelloLegacyConnector(user.trello);
    case Constants.taskProviders.sociocortex:
      return new SociocortexConnector(user.sociocortex);
    default:
      return new TrelloLegacyConnector(user.trello);
  }
}
