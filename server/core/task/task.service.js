class TaskService {

  constructor(user) {
    this._user = user;
  }

  static mergeTaskObjects(mongoTask, providerTask) {
    // convert to plain object and re-append parameters to avoid mongo removing them before serialization
    const task = mongoTask.toObject();
    task.parameters = providerTask.parameters;
    return task;
  }

  async configure(username, password, providerSpecificData) {
    throw new Error("Not yet implemented: Method 'configure' has to be overridden by inheriting classes.");
  }

  async setup(providerSpecificData) {
    throw new Error("Not yet implemented: Method 'setup' has to be overridden by inheriting classes.");
  }

  async teardown(providerSpecificData) {
    throw new Error("Not yet implemented: Method 'teardown' has to be overridden by inheriting classes.");
  }

  async create(task) {
    throw new Error("Not yet implemented: Method 'create' has to be overridden by inheriting classes.");
  }

  async get(providerId) {
    throw new Error("Not yet implemented: Method 'get' has to be overridden by inheriting classes.");
  }

  async update(providerId, task) {
    throw new Error("Not yet implemented: Method 'update' has to be overridden by inheriting classes.");
  }

  async delete(providerId) {
    throw new Error("Not yet implemented: Method 'delete' has to be overridden by inheriting classes.");
  }

  async link(providerId, frontendUrl) {
    throw new Error("Not yet implemented: Method 'link' has to be overridden by inheriting classes.");
  }

  async unlink(providerId, frontendUrl) {
    throw new Error("Not yet implemented: Method 'unlink' has to be overridden by inheriting classes.");
  }

  async list() {
    throw new Error("Not yet implemented: Method 'list' has to be overridden by inheriting classes.");
  }

}

export default TaskService;

