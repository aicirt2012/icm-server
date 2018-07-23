import Constants from "../../../config/constants";
import Task from "../../models/task.model"
import User from "../../models/user.model"
import TaskService from "./task.service";
import TrelloConnector from "./connector/trello.connector";
import TrelloAssembler from "./assembler/trello.assembler";

class TrelloService extends TaskService {

  constructor(user) {
    super(user);
    this._connector = new TrelloConnector(this._user.taskProviders.trello.trelloAccessToken);
  }

  async configure(email, password, providerSpecificData) {
    const emailAlreadyInUse = await User.findOne({
      _id: {$ne: this._user._id},
      'taskProviders.trello.isEnabled': false,
      'taskProviders.trello.registrationEmail': email,
      'taskProviders.trello.registrationStarted': {$gt: new Date(Date.now() - 60000)},  // start date is less than 60 seconds ago
    });
    if (emailAlreadyInUse) {
      const error = new Error("e-mail already in use");
      error.code = 409;
      error.message = "Specified e-mail address is currently in use for another registration process. Please wait 60 seconds and try again.";
      throw error;
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
    const response = await this._user.save();
    this._connector = new TrelloConnector(this._user.taskProviders.trello.trelloAccessToken);
    await this._connector.checkAccessToken();
    return response;
  }

  async teardown(providerSpecificData) {
    // TODO make parallel
    const tasks = await Task.find({provider: Constants.taskProviders.trello, user: this._user._id});
    for (let task of tasks) {
      await this.unlink(task.providerId);
    }
    this._user.taskProviders.trello.isEnabled = false;
    this._user.taskProviders.trello.trelloAccessToken = "";
    this._user.taskProviders.trello.registrationEmail = "";
    this._user.taskProviders.trello.registrationStarted = "";
    return await this._user.save();
  }

  async create(task) {
    const taskToCreate = TrelloAssembler.Task.toExternalObject(task);
    const createdTrelloTask = await this._connector.createTask(taskToCreate);
    return TrelloAssembler.Task.fromExternalObject(createdTrelloTask);
  }

  async get(trelloId) {
    const trelloTask = await this._connector.getTask(trelloId);
    return TrelloAssembler.Task.fromExternalObject(trelloTask);
  }

  async update(trelloId, task) {
    const trelloTask = TrelloAssembler.Task.toExternalObject(task);
    const updatedTrelloTask = await this._connector.updateTask(trelloId, trelloTask);
    return TrelloAssembler.Task.fromExternalObject(updatedTrelloTask);
  }

  async delete(trelloId) {
    const deletedTrelloTask = await this._connector.deleteTask(trelloId);
    return TrelloAssembler.Task.fromExternalObject(deletedTrelloTask);
  }

  async link(trelloId, frontendUrl) {
    const trelloTask = await this._connector.getTask(trelloId);
    await this._connector.addAttachmentUrl(trelloId, frontendUrl);
    return TrelloAssembler.Task.fromExternalObject(trelloTask);
  }

  async unlink(trelloId, frontendUrl) {
    await this._connector.removeAttachmentUrl(trelloId, frontendUrl);
  }

  async list() {
    const tasks = await this._connector.searchTasks();
    tasks.forEach(trelloTask => TrelloAssembler.Task.fromExternalObject(trelloTask));
    return tasks;
  }

  async listBoards() {
    const boards = await this._connector.listMyBoards();
    boards.forEach(trelloBoard => TrelloAssembler.Board.fromExternalObject(trelloBoard));
    return boards;
  }

  async getMembers(boardId) {
    const members = await this._connector.getMembers(boardId);
    members.forEach(trelloMember => TrelloAssembler.Member.fromExternalObject(trelloMember));
    return members;
  }

  async getTasks(listId) {
    const tasks = await this._connector.getTasks(listId);
    tasks.forEach(trelloTask => TrelloAssembler.Task.fromExternalObject(trelloTask));
    return tasks;
  }

}

export default TrelloService;
