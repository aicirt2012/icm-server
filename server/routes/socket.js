import express from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config/env';
import emailCtrl from '../controllers/email.controller';
import http from 'http';
import socketIo from 'socket.io';
import Email from './../models/email.model';
import _ from 'lodash';


class Socket{

  /** maps the userId to the related open socket */
  userSockets = new Map(); //<userId, socketId>
  server  = http.createServer(express);
  io = socketIo(this.server);

  constructor() {

      this.server.listen(config.socketPort);

      this.io.use((socket, next)=>{
        const token = socket.request._query['token'];
        if(jwt.verify(token, config.jwt.secret)){
          socket.userId = jwt.decode(token).user._id;
          next();
        }else{
          console.log('Not Authenticated!');
        }
      });

      this.io.on('connection', (socket)=>{
        console.log('new socket '+socket.id + ' for user '+socket.userId);
        this.userSockets.set(socket.userId.toString(), socket.id);

        socket.on('disconnect', (socket)=>{
          console.log('socket closed');
          this.userSockets.delete(socket.userId);
        });
      });

  }

  pushEmailUpdateToClient(emailOld, boxOld, emailNew, boxNew) {
    if (this.isEmailCreated(emailOld, emailNew)) 
      this.createEmail(emailNew.user, emailNew);
    else if (this.isEmailUpdated(emailOld, emailNew)) 
      this.updateEmail(emailNew.user, emailNew);
    else if (this.isEmailDeleted(emailOld, emailNew))
      this.deleteEmail(emailOld.user, emailOld);
    this.pushBoxUpdateToClient(boxOld, boxNew);
  }

  pushBoxUpdateToClient(boxOld, boxNew) {
    if (this.isBoxCreated(boxOld, boxNew)) 
      this.createBox(boxNew.user, boxNew);
    else if (this.isBoxUpdated(boxOld, boxNew)) 
      this.updateBox(boxNew.user, boxNew);
    else if (this.isBoxDeleted(boxOld, boxNew))
      this.deleteBox(boxOld.user, boxOld);
  }


  isEmailDeleted(boxOld, boxlNew){
    return boxOld != null && boxlNew == null;
  }

  isEmailCreated(emailOld, emailNew){
    return emailOld == null && emailNew != null;
  }

  isEmailUpdated(emailOld, emailNew){
    return !_.isEqual(emailOld.labels, emailNew.labels) ||
      !_.isEqual(emailOld.box, emailNew.box) ||
      !_.isEqual(emailOld.attrs, emailNew.attrs) ||
      !_.isEqual(emailOld.flags, emailNew.flags);
  }

  isEmailDeleted(emailOld, emailNew){
    return emailOld != null && emailNew == null;
  }

  isBoxCreated(boxOld, boxlNew){
    return boxOld == null && boxlNew != null;
  }

  isBoxUpdated(boxOld, boxlNew){
    return !_.isEqual(boxOld.unseen, boxlNew.unseen) ||
      !_.isEqual(boxOld.name, boxlNew.name) ||
      !_.isEqual(boxOld.parent, boxlNew.parent)
  }

  isBoxDeleted(boxOld, boxNew){
    return boxOld != null && boxNew == null;
  }

  createEmail(userId, email){
    this.emitToUser(userId, 'create_email', email);
  }

  updateEmail(userId, email){
    this.emitToUser(userId, 'update_email', email);
  }

  deleteEmail(userId, email){
    this.emitToUser(userId, 'delete_email', email);
  }

  createBox(userId, box){
    this.emitToUser(userId, 'create_box', box);
  }

  updateBox(userId, box){
    this.emitToUser(userId, 'update_box', box);
  }

  deleteBox(userId, box){
    this.emitToUser(userId, 'delete_box', box);
  }

  emitToUser(userId, msgType, msgContent){
    userId = userId.toString();
    if(this.userSockets.has(userId)){
      const socketId = this.userSockets.get(userId);
      this.io.sockets.connected[socketId].emit(msgType, JSON.stringify(msgContent));
      console.log('Emit Message: '+userId+' '+msgType+' '+ (msgContent.subject ? msgContent.subject : msgContent.name));
    }
  }

}

/* exporting the instance ensures the usage as singelton pattern */
export default new Socket();
