import SociocortexConnector from "./connector/sociocortex.connector";
import SociocortexAssembler from "./assembler/sociocortex.assembler";
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
    const tasks = await Task.find({provider: Constants.taskProviders.sociocortex, user: this._user._id});
    for (let task of tasks) {
      await this.unlink(task.providerId);
    }
    this._user.taskProviders.sociocortex.isEnabled = false;
    this._user.taskProviders.sociocortex.email = "";
    this._user.taskProviders.sociocortex.password = "";
    return await this._user.save();
  }

  async create(task) {
    throw new Error("Task creation is not supported by the Sociocortex service!");
  }

  async get(provider_id) {
    const sociocortexTask = await this._connector.getTask(provider_id);
    return SociocortexAssembler.Task.fromExternalObject(sociocortexTask);
  }

  async update(provider_id, task) {
    const providerTask = await this.get(provider_id);

    const updatedDueDate = task.getParameter("dueDate");
    if (updatedDueDate && providerTask.getParameter("dueDate") !== updatedDueDate) {
      // TODO update due date
    }

    const updatedOwnerId = task.getParameter("ownerId");
    if (updatedOwnerId && providerTask.getParameter("ownerId") && providerTask.getParameter("ownerId") !== updatedOwnerId) {
      // TODO update owner
    }

    // TODO check and update dynamic params

    return await this.get(provider_id);
  }

  async delete(provider_id) {
    throw new Error("Task deletion is not supported by the Sociocortex service!");
  }

  async link(provider_id, frontend_url) {
    const updatedSociocortexTask = await this._connector.updateExternalId(provider_id, frontend_url);
    return SociocortexAssembler.Task.fromExternalObject(updatedSociocortexTask);
  }

  async unlink(provider_id, frontend_url) {
    await this._connector.updateExternalId(provider_id, null);
  }

  async list() {
    throw new Error("Not yet implemented: Method 'list' is not yet implemented for Sociocortex service.");  // TODO implement
  }

  async listWorkspaces() {
    const response = await this._connector.getMyWorkspaces();
    const workspaces = [];
    response.forEach(workspace => {
      if (workspace.id !== 'root') {
        workspaces.push(SociocortexAssembler.Workspace.fromExternalObject(workspace))
      }
    });
    return workspaces;
  }

}

export default SociocortexService;
