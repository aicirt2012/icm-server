import SociocortexConnector from "./connectors/sociocortex.connector";
import TaskService from "./task.service";
import Constants from "../../../config/constants";
import Task from "../../models/task.model";

class SociocortexService extends TaskService {

  constructor(user) {
    super(user);
    this._connector = new SociocortexConnector(this._user.taskProviders.sociocortex.email, this._user.taskProviders.sociocortex.password);
  }

  async configure(email, password, providerSpecificData) {
    this._user.taskProviders.sociocortex.isEnabled = false;
    this._user.taskProviders.sociocortex.email = email;
    this._user.taskProviders.sociocortex.password = password;
    return await this._user.save();
  }

  async setup(providerSpecificData) {
    this._user.taskProviders.sociocortex.isEnabled = true;
    const response = await this._user.save();
    await this._connector.checkConnection();
    return response;
  }

  async teardown(providerSpecificData) {
    // TODO make parallel
    const cursor = await Task.find({provider: Constants.taskProviders.sociocortex});
    for (let task = await cursor.next(); task != null; task = await cursor.next()) {
      await this.unlink(task.providerId);
    }
    this._user.taskProviders.sociocortex.isEnabled = false;
    return await this._user.save();
  }

  async create(task) {
    // TODO think about using more specific/custom error class
    throw new Error("Task creation is not supported by the Sociocortex service!");
  }

  async get(provider_id) {
    const response = await this._connector.getTask(provider_id);
    const task = {};
    task.provider = Constants.taskProviders.trello;
    task.providerId = response.id;
    task.parameters = [
      {name: 'name', value: response.name},
      {name: 'description', value: response.description},
      {name: 'due', value: response.scheduledDate},
      {name: 'case', value: response.case},
      {name: 'ownerId', value: response.owner ? response.owner.id : ""},
      {name: 'ownerEmail', value: response.owner ? response.owner.email : ""},
      {name: 'state', value: response.state},
    ];
    // TODO parse and append the actual, dynamic parameters from sociocortex
    return task;
  }

  async update(provider_id, task) {

    throw new Error("Not yet implemented!");
  }

  async delete(provider_id) {
    // TODO think about using more specific/custom error class
    throw new Error("Task deletion is not supported by the Sociocortex service!");
  }

  async link(provider_id, frontend_url) {
    throw new Error("Not yet implemented: Method 'link' is not yet implemented for Sociocortex service.");
  }

  async unlink(provider_id) {
    throw new Error("Not yet implemented: Method 'unlink' is not yet implemented for Sociocortex service.");
  }

  async list() {
    throw new Error("Not yet implemented: Method 'list' is not yet implemented for Sociocortex service.");
  }

}

export default SociocortexService;
