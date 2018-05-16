import TrelloService from "./trello.service";
import SociocortexService from "./sociocortex.service";
import Constants from "../../../config/constants";

class TaskService {

  constructor(user) {
    this._user = user;
  }

  async configure(username, password, providerSpecificData) {
    throw new Error("Not yet implemented: Method 'configure' has to be overridden by inheriting classes.");
  }

  async setup(providerSpecificData) {
    throw new Error("Not yet implemented: Method 'setup' has to be overridden by inheriting classes.");
  }

  async teardown(providerSpecificData) {
    throw new Error("Not yet implemented: Method 'teardown' has to be overridden by inheriting classes.");
  }

  async create(task) {
    throw new Error("Not yet implemented: Method 'create' has to be overridden by inheriting classes.");
  }

  async get(provider_id) {
    throw new Error("Not yet implemented: Method 'get' has to be overridden by inheriting classes.");
  }

  async update(provider_id, task) {
    throw new Error("Not yet implemented: Method 'update' has to be overridden by inheriting classes.");
  }

  async delete(provider_id) {
    throw new Error("Not yet implemented: Method 'delete' has to be overridden by inheriting classes.");
  }

  static get(providerName, user) {
    switch (providerName) {
      case Constants.taskProviders.trello:
        return new TrelloService(user);
      case Constants.taskProviders.sociocortex:
        return new SociocortexService(user);
      default:
        throw new Error("No such task service: '" + providerName + "'.");
    }
  }

}

export default TaskService;
