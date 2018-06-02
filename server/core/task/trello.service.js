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

  async configure(email, password, providerSpecificData) {
    const emailAlreadyInUse = await User.findOne({
      'taskProviders.trello.isEnabled': false,
      'taskProviders.trello.registrationEmail': email,
      'taskProviders.trello.registrationStarted': {$gt: new Date(Date.now() - 60000)},  // start date is less than 60 seconds ago
    });
    if (emailAlreadyInUse) {
      throw new Error("Specified e-mail address currently in use for another registration process. Please wait 60 seconds and try again.");
    } else {
      this._user.taskProviders.trello.isEnabled = false;
      this._user.taskProviders.trello.registrationEmail = email;
      this._user.taskProviders.trello.registrationStarted = new Date();
      return await this._user.save();
    }
  }

  async setup(requestBody) {
    this._user.taskProviders.trello.isEnabled = true;
    this._user.taskProviders.trello.trelloAccessToken = requestBody.token;
    await this._user.save();
    return await this.verifySetup();
  }

  async verifySetup() {
    // TODO implement
  }

  async teardown(providerSpecificData) {
    // TODO make parallel
    const cursor = await Task.find({provider: Constants.taskProviders.trello});
    for (let task = await cursor.next(); task != null; task = await cursor.next()) {
      await this.unlink(task.providerId);
    }
    this._user.taskProviders.trello.isEnabled = false;
    this._user.taskProviders.trello.trelloAccessToken = "";
    return await this._user.save();
  }

  async create(task) {
    const trelloTask = {};
    task.parameters.forEach(function (parameter) {
      if (parameter.value) {
        trelloTask[parameter.name] = parameter.value;
      } else if (parameter.defaultValues && parameter.defaultValues.length > 0) {
        trelloTask[parameter.name] = parameter.defaultValues[0];
      }
    });
    const response = await this._connector.createTask(trelloTask);
    const resultingTask = {};
    resultingTask.provider = Constants.taskProviders.trello;
    resultingTask.providerId = response.id;
    resultingTask.parameters = [
      {name: 'name', value: response.name},
      {name: 'desc', value: response.desc},
      {name: 'due', value: response.due},
      {name: 'closed', value: response.closed},
      {name: 'idBoard', value: response.idBoard},
      {name: 'idList', value: response.idList},
      {name: 'idMembers', value: response.idMembers},
      {name: 'shortUrl', value: response.shortUrl}
    ];
    return resultingTask;
  }

  async get(provider_id) {
    const response = await this._connector.getTask(provider_id);
    const task = {};
    task.provider = Constants.taskProviders.trello;
    task.providerId = response.id;
    task.parameters = [
      {name: 'name', value: response.name},
      {name: 'desc', value: response.desc},
      {name: 'due', value: response.due},
      {name: 'closed', value: response.closed},
      {name: 'idBoard', value: response.idBoard},
      {name: 'idList', value: response.idList},
      {name: 'idMembers', value: response.idMembers},
      {name: 'shortUrl', value: response.shortUrl}
    ];
    return task;
  }

  async update(provider_id, task) {
    const trelloTask = {};
    task.parameters.forEach(function (parameter) {
      if (parameter.value) {
        trelloTask[parameter.name] = parameter.value;
      } else if (parameter.defaultValues && parameter.defaultValues.length > 0) {
        trelloTask[parameter.name] = parameter.defaultValues[0];
      }
    });
    const response = await this._connector.updateTask(provider_id, trelloTask);
    const resultingTask = {};
    resultingTask.provider = Constants.taskProviders.trello;
    resultingTask.providerId = response.id;
    resultingTask.parameters = [
      {name: 'name', value: response.name},
      {name: 'desc', value: response.desc},
      {name: 'due', value: response.due},
      {name: 'closed', value: response.closed},
      {name: 'idBoard', value: response.idBoard},
      {name: 'idList', value: response.idList},
      {name: 'idMembers', value: response.idMembers},
      {name: 'shortUrl', value: response.shortUrl}
    ];
    return resultingTask;
  }

  async delete(provider_id) {
    const response = await this._connector.deleteTask(provider_id);
    const task = {};
    task.provider = Constants.taskProviders.trello;
    task.providerId = response.id;
    task.parameters = [
      {name: 'name', value: response.name},
      {name: 'desc', value: response.desc},
      {name: 'due', value: response.due},
      {name: 'closed', value: response.closed},
      {name: 'idBoard', value: response.idBoard},
      {name: 'idList', value: response.idList},
      {name: 'idMembers', value: response.idMembers},
      {name: 'shortUrl', value: response.shortUrl}
    ];
    return task;
  }

  async link(provider_id, frontend_url) {
    throw new Error("Not yet implemented: Method 'link' is not yet implemented for Trello service.");
  }

  async unlink(provider_id) {
    throw new Error("Not yet implemented: Method 'unlink' is not yet implemented for Trello service.");
  }

  async list() {
    const response = await this._connector.searchTasks();
    const tasks = [];
    response.forEach(task => {
      tasks.push({
        provider: Constants.taskProviders.trello,
        providerId: task.id,
        parameters: [
          {name: 'name', value: task.name},
          {name: 'idBoard', value: task.idBoard},
          {name: 'idList', value: task.idList},
          {name: 'closed', value: task.closed},
        ]
      });
    });
    return tasks;
  }

  async listBoards() {
    const response = await this._connector.searchBoards();
    const boards = [];
    response.forEach(board => {
      boards.push({
        id: board.id,
        name: board.name,
        closed: board.closed
      });
    });
    return boards;
  }

}

export default TrelloService;
