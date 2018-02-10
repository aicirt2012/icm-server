import Constants from "../../../config/constants";
import Task from "../../models/task.model";
import Promise from "bluebird";
import {createTaskConnector} from "./util";

class TaskService{
 static addLinkedTasksToEmail(email,user)
  {
    console.log(email);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log(user);
    return new Promise((resolve, reject) => {
      let promises = [];
      Task.find({
        $or: [{
          email: email._Id
        }, {
          thrid: email.thrid
        }]
      }).then((tasks) => {
        tasks.forEach((t) => {
          let connector = createTaskConnector(t.provider, user);
          promises.push(connector.getTask(t.taskId));
        });
        Promise.all(promises).then((results) => {
          this.linkedTasks = results.map((r) => {
            r['taskType'] = Constants.taskTypes.linked;
            return r;
          }).filter((task) => task.closed == false);
          //resolve(results);
          email.linkedTasks = results;
          resolve(email);
        });
      }).catch((err) => {
        reject();
      });
    });
  }
}
export default TaskService;
