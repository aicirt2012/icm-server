import Constants from "../../../config/constants";
import Task from "../../models/task.model";
import Promise from "bluebird";
import {createTaskConnector} from "./util";

class TaskService {

  static addLinkedTasksToEmail(email, user) {
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
          promises.push(this.getTaskWithBoardMembers(t.taskId, t.provider, user));
        });
        Promise.all(promises).then((results) => {
          this.linkedTasks = results.map((r) => {
            r['taskType'] = Constants.taskTypes.linked;
            r['board'] = TaskService.convertToMinimalEntity(r.board);
            return r;
          }).filter((task) => !task.closed);
          email.linkedTasks = results;
          resolve(email);
        });
      }).catch((err) => {
        reject();
      });
    });
  }


  static getTaskWithBoardMembers(taskId, TaskProvider, user) {

    let connector = createTaskConnector(TaskProvider, user);
    return connector.getTask(taskId).then((task) => {
      return connector.getMembersForBoard(task.board.id).then((members) => {
        task.board.members = members;
        return task;
      })
    }).catch((err) => {
      reject(err);
    });
  }


  static getBoardsForMember(taskProvider, user) {
    let connector = createTaskConnector(taskProvider, user);
    return new Promise((resolve, reject) => {

      let params = {};
      connector.getBoardsForMember(params).then(boards => {
        let promises = [];
        boards.forEach((b) => {
          promises.push(connector.getBoard(b.id, params));
        });
        Promise.all(promises).then((res) => {
          resolve(res);
        });
      }).catch((err) => {
        reject(err);
      });
    });

  }

  static convertToMinimalEntity(board) {
    return board ? {
      id: board.id,
      name: board.name,
      members: board.members,
      lists: board.lists,
      cards: board.cards
    } : {};
  }

}

export default TaskService;
