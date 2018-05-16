import Constants from "../../../config/constants";
import Task from "../../models/task.model"
import User from "../../models/user.model"
import TaskService from "./task.service";

class TrelloService extends TaskService {

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

export default TrelloService;
