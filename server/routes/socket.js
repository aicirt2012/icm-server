import express from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config/env';
import emailCtrl from '../controllers/email.controller';
import http from 'http';
import socketIo from 'socket.io';



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
    userId = userId.toString();
    if(this.userSockets.has(userId)){   
      const socketId = this.userSockets.get(userId);
      this.io.sockets.connected[socketId].emit(msgType, JSON.stringify(msgContent));
      console.log('Emit Message: '+userId+' '+msgType+' '+msgContent.subject);
    }
  }
}

export default new Socket();
