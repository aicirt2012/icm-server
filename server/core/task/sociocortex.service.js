import SociocortexConnector from "./sociocortex.connector";
import TaskService from "./task.service";

class SociocortexService extends TaskService {

  constructor(user) {
    super(user);
    this._connector = new SociocortexConnector(this._user.taskProviders.sociocortex.email);
  }

  async configure(username, password, providerSpecificData) {
    throw new Error("Not yet implemented!");
  }

  async setup(providerSpecificData) {
    throw new Error("Not yet implemented!");
  }

  async teardown(providerSpecificData) {
    throw new Error("Not yet implemented!");
  }

  async create(task) {
    throw new Error("Not yet implemented!");
  }

  async get(provider_id) {
    throw new Error("Not yet implemented!");
  }

  async update(provider_id, task) {
    throw new Error("Not yet implemented!");
  }

  async delete(provider_id) {
    throw new Error("Not yet implemented!");
  }

}

export default SociocortexService;
