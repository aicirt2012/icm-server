import Constants from "../../../config/constants";
import Task from "../../models/task.model"
import User from "../../models/user.model"
import TaskService from "./task.service";
import TrelloConnector from "./trello.connector";

class TrelloService extends TaskService {

  constructor(user) {
    super(user);
    this._connector = new TrelloConnector(this._user.taskProviders.trello.trelloAccessToken);
  }

  async configure(username, password, providerSpecificData) {
    let emailAlreadyInUse = await User.findOne({
      'taskProviders.trello.isEnabled': false,
      'taskProviders.trello.registrationEmail': username,
      'taskProviders.trello.registrationStarted': {$gt: new Date(Date.now() - 60000)},  // start date is less than 60 seconds ago
    });
    if (emailAlreadyInUse) {
      throw new Error("Specified e-mail address currently in use for another registration process. Please wait 60 seconds and try again.");
    } else {
      this._user.taskProviders.trello.registrationEmail = username;
      this._user.taskProviders.trello.registrationStarted = new Date();
      return await this._user.save();
    }
  }

  async setup(providerSpecificData) {
    this._user.taskProviders.trello.isEnabled = true;
    this._user.taskProviders.trello.trelloAccessToken = providerSpecificData;
    return await this._user.save();
  }

  async teardown(providerSpecificData) {
    const cursor = await Task.find({provider: Constants.taskProviders.trello});
    for (let task = await cursor.next(); task != null; task = await cursor.next()) {
      // await this.delete(task.providerId);  // TODO decide whether to do anything at all or to just leave all data in external systems as it is
      await task.delete();
    }
    this._user.taskProviders.trello.isEnabled = false;
    this._user.taskProviders.trello.trelloAccessToken = "";
    return await this._user.save();
  }

  async create(task) {
    const trelloTask = {};  // TODO map from task object to trello
    const response = await this._connector.createTask(trelloTask);
    const resultingTask = new Task();
    // TODO map from trello response to task object
    return resultingTask;
  }

  async get(provider_id) {
    const response = await this._connector.getTask(provider_id);
    const task = new Task();
    // TODO map from trello response to task object
    return task;
  }

  async update(provider_id, task) {
    const trelloTask = {};  // TODO map from task object to trello
    const response = await this._connector.updateTask(provider_id, trelloTask);
    const resultingTask = new Task();
    // TODO map from trello response to task object
    return resultingTask;
  }

  async delete(provider_id) {
    const response = await this._connector.deleteTask(provider_id);
    // TODO map from trello response to task object
    return response;
  }

}

export default TrelloService;
