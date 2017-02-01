import express from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config/env';
import emailCtrl from '../controllers/email.controller';
import http from 'http';
import socketIo from 'socket.io';


class Socket{

  /** maps the userId to the related open socket */
  userSockets = new Map();
  server  = http.createServer(express);
  io = socketIo(this.server);

  constructor() {
    this.server.listen(config.socketPort);

    this.io.use((socket, next)=>{
      /*
       const token = socket.request._query['token'];
       if(jwt.verify(token, config.jwt.secret)){
       socket.userId = jwt.decode(token).user._id;
       next();
       }else{
       console.log('Not Authenticated!');
       }*/
      socket.userId = 1;
      next();
    });

    this.io.on('connection', (socket)=>{
      console.log('new socket '+socket.id + ' for user '+socket.userId);

      socket.on('disconnect', (socket)=>{
        console.log('socket closed');
      });

      //TODO remove only for testing
      emitMsg();
      function emitMsg(){
        setTimeout(()=>{
          socket.emit('message', 'some date');
          console.log('send msg');
          emitMsg();
        }, 1000);
      }
    });
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

  emitToUser(userId, msgType, msgContent){
    if(this.userSockets.has(userId)){
      const socketId = this.userSockets.get(userId);
      this.io.sockets.connected[socketId].emit(msgType, msgContent);
      console.log(userId+' '+msgType+' '+msgContent);
    }
  }
}

export default Socket;
