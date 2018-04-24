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
          email.linkedTasks = results.map((task) => {
            task['taskType'] = Constants.taskTypes.linked;
            task['board'] = TaskService.convertBoardToMinimalEntity(task.board);
            return task;
          }).filter(task => !task.closed);
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
          if (res.members) {
            res.members.forEach(member => TaskService.convertMemberToMinimalEntity(member));
          }
          resolve(res);
        });
      }).catch((err) => {
        reject(err);
      });
    });

  }

  static convertBoardToMinimalEntity(board) {
    return board ? {
      id: board.id,
      name: board.name,
      members: board.members,
      lists: board.lists,
      cards: board.cards
    } : {};
  }

  static convertMemberToMinimalEntity(member) {
    return member ? {
      avatarHash: member.avatarHash,
      fullName: member.fullName,
      id: member.id,
      initials: member.initials,
      username: member.username,
    } : {};
  }

}

export default TaskService;
