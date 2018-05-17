import SociocortexConnector from "./sociocortex.connector";
import TaskService from "./task.service";

class SociocortexService extends TaskService {

  constructor(user) {
    super(user);
    this._connector = new SociocortexConnector(this._user.taskProviders.sociocortex.email);
  }

  async configure(email, password, providerSpecificData) {
    this._user.taskProviders.sociocortex.isEnabled = false;
    this._user.taskProviders.sociocortex.email = email;
  }

  async setup(providerSpecificData) {
    this._user.taskProviders.sociocortex.isEnabled = true;
  }

  async teardown(providerSpecificData) {
    this._user.taskProviders.sociocortex.isEnabled = false;
  }

  async create(task) {
    // TODO think about using more specific/custom error class
    throw new Error("Task creation is not supported by this service!");
  }

  async get(provider_id) {
    throw new Error("Not yet implemented!");
  }

  async update(provider_id, task) {
    throw new Error("Not yet implemented!");
  }

  async delete(provider_id) {
    // TODO think about using more specific/custom error class
    throw new Error("Task deletion is not supported by this service!");
  }

}

export default SociocortexService;
