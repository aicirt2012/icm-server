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

  async get(sociocortexId) {
    const sociocortexTask = await this._connector.getTask(sociocortexId);
    return SociocortexAssembler.Task.fromExternalObject(sociocortexTask);
  }

  async update(sociocortexId, task) {
    let sociocortexTask = await this.get(sociocortexId);

    const updatedDynamicParams = task.getParameter("dynamicParameters");
    if (updatedDynamicParams && sociocortexTask.getParameter("dynamicParameters") !== updatedDynamicParams) {
      const draftedSociocortexTask = SociocortexAssembler.Task.toExternalObject(task);
      sociocortexTask = await this._connector.draftTask(sociocortexId, draftedSociocortexTask);
    }
    const updatedDueDate = task.getParameter("dueDate");
    if (updatedDueDate && sociocortexTask.getParameter("dueDate") !== updatedDueDate) {
      sociocortexTask = await this._connector.updateDueDate(sociocortexId, updatedDueDate);
    }
    const updatedOwnerId = task.getParameter("ownerId");
    if (updatedOwnerId && sociocortexTask.getParameter("ownerId") && sociocortexTask.getParameter("ownerId") !== updatedOwnerId) {
      sociocortexTask = await this._connector.updateOwner(sociocortexId, updatedOwnerId)
    }
    return SociocortexAssembler.Task.fromExternalObject(sociocortexTask);
  }

  async delete(sociocortexId) {
    throw new Error("Task deletion is not supported by the Sociocortex service!");
  }

  async link(sociocortexId, frontendUrl) {
    const task = this.get(sociocortexId);
    if (task.getParameter('state') === Constants.sociocortexTaskStates.enabled) {
      this._connector.activateTask(sociocortexId, task.getParameter('resourceType'));
    }
    const updatedSociocortexTask = await this._connector.updateExternalId(sociocortexId, frontendUrl);
    return SociocortexAssembler.Task.fromExternalObject(updatedSociocortexTask);
  }

  async unlink(sociocortexId, frontendUrl) {
    await this._connector.updateExternalId(sociocortexId, null);
  }

  async completeTask(sociocortexId) {
    const task = this.get(sociocortexId);
    const completedTask = await this._connector.completeTask(sociocortexId, task.getParameter('resourceType'));
    return SociocortexAssembler.Task.fromExternalObject(completedTask);
  }

  async terminateTask(sociocortexId) {
    const task = this.get(sociocortexId);
    const terminatedTask = await this._connector.terminateTask(sociocortexId, task.getParameter('resourceType'));
    return SociocortexAssembler.Task.fromExternalObject(terminatedTask);
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

  async getCases(workspaceId) {
    const response = await this._connector.getCases(workspaceId);
    const cases = [];
    response.forEach(sociocortexCase => {
      cases.push(SociocortexAssembler.Case.fromExternalObject(sociocortexCase))
    });
    return cases;
  }

  async getTasks(caseId) {
    const response = await this._connector.getTasks(caseId);
    const tasks = [];
    response.forEach(sociocortexTask => {
      tasks.push(SociocortexAssembler.Task.fromExternalObject(sociocortexTask[0]))
    });
    return tasks;
  }

  async getPossibleOwners(taskId) {
    const response = await this._connector.getPossibleOwners(taskId);
    const users = [];
    response.forEach(sociocortexUser => {
      users.push(SociocortexAssembler.User.fromExternalObject(sociocortexUser))
    });
    return users;
  }

}

export default SociocortexService;
