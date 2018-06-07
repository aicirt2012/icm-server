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

  async get(providerId) {
    const sociocortexTask = await this._connector.getTask(providerId);
    return SociocortexAssembler.Task.fromExternalObject(sociocortexTask);
  }

  async update(providerId, task) {
    let sociocortexTask = await this.get(providerId);

    const updatedDynamicParams = task.getParameter("dynamicParameters");
    if (updatedDynamicParams && sociocortexTask.getParameter("dynamicParameters") !== updatedDynamicParams) {
      const draftedSociocortexTask = SociocortexAssembler.Task.toExternalObject(task);
      sociocortexTask = await this._connector.draftTask(providerId, draftedSociocortexTask);
    }
    const updatedDueDate = task.getParameter("dueDate");
    if (updatedDueDate && sociocortexTask.getParameter("dueDate") !== updatedDueDate) {
      sociocortexTask = await this._connector.updateDueDate(providerId, updatedDueDate);
    }
    const updatedOwnerId = task.getParameter("ownerId");
    if (updatedOwnerId && sociocortexTask.getParameter("ownerId") && sociocortexTask.getParameter("ownerId") !== updatedOwnerId) {
      sociocortexTask = await this._connector.updateOwner(providerId, updatedOwnerId)
    }
    return SociocortexAssembler.Task.fromExternalObject(sociocortexTask);
  }

  async delete(providerId) {
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
