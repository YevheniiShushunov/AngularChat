import { AuthorizationService } from './../authorization/authorization.service';
import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject} from 'rxjs';

import { io } from 'socket.io-client';
import { IRooms, IMessage } from './message.interface';
import { v4 as uuid } from 'uuid';

import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root'
})
export class ChatroomService {
  chatUrl = environment.chatUrl;
  socket = io(environment.socketUrl);
  message$: Subject<IMessage> = new Subject();

  date = new Date();
  userId:string = '';
  activeRoom = {
      roomId: '',
      name: "",
      status: false,
      createrId: ""
  };

  token = localStorage.getItem('token');

  constructor(private http: HttpClient, public logUser: AuthorizationService) { }

  public sendMessage(message:string){
      const messageUid = uuid();
      JSON.stringify(message);
      this.socket.emit('message', this.activeRoom.roomId.toString() , {messageid: messageUid, userId: this.logUser.userId, login: this.logUser.user, message, date: this.date});
  }

  getRooms():Observable<IRooms[]>{
      const token = localStorage.getItem("token");
      const httpOptions = {
          headers: new HttpHeaders({
              "Authorization": `Bearer ${token}`,
              'Content-Type': "application/json"
          }),
          withCredentials: true
      };
      return this.http.get<IRooms[]>(this.chatUrl, httpOptions)
          .pipe();
  }

  getMessagesByRoomId(roomId:string):Observable<IMessage[]>{
      const httpOptions = {
          headers: new HttpHeaders({
              "Authorization": `Bearer ${this.token}`,
              'Content-Type': "application/json"
          }),
          withCredentials: true
      };
      return this.http.get<IMessage[]>(this.chatUrl + `/${roomId}`, httpOptions).pipe();
  }

  createRoom(roomName:string):Observable<IRooms>{
      const data = {name: roomName,user_id: this.logUser.userId};
      const httpOptions = {
          headers: new HttpHeaders({
              "Authorization": `Bearer ${this.token}`,
              'Content-Type': "application/json"
          }),
          withCredentials: true
      };
      return this.http.post<IRooms>(this.chatUrl, data, httpOptions).pipe();
  }

  joinTheRoom(roomname:string, roomId:string){
      this.socket.emit('join-room', {
          name: roomname, roomId: JSON.stringify(roomId), login: this.logUser.user
      });
  }

  public getNewMessage(){
      this.socket.on('message', (message) =>{
          this.message$.next(message);
      });
      return this.message$;
  }

  deleteRoomById(roomId:string):Observable<string>{
      const token = localStorage.getItem("token");
      const httpOptions = {
          headers: new HttpHeaders({
              "Authorization": `Bearer ${token}`,
              'Content-Type': "application/json"
          }),
          withCredentials: true
      };
      return this.http.delete<string>(
          this.chatUrl +`/${roomId}`,httpOptions);
  }

  deleteMessageById(messageId:string):Observable<string>{
      const token = localStorage.getItem("token");
      const httpOptions = {
          headers: new HttpHeaders({
              "Authorization": `Bearer ${token}`,
              'Content-Type': "application/json"
          }),
          withCredentials: true
      };
      return this.http.delete<string>(
          this.chatUrl + '/messages/' + `${messageId}`, httpOptions);
  }

  getMessagesCount():Observable<string[]>{
      const token = localStorage.getItem("token");
      const httpOptions = {
          headers: new HttpHeaders({
              "Authorization": `Bearer ${token}`,
              'Content-Type': "application/json"
          }),
          withCredentials: true
      };
      return this.http.get<string[]>(this.chatUrl + '/messages', httpOptions);
  }

  closeRoomById(roomId:string):Observable<string>{
      const room = {roomId: roomId};
      const token = localStorage.getItem("token");
      const httpOptions = {
          headers: new HttpHeaders({
              "Authorization": `Bearer ${token}`,
              'Content-Type': "application/json"
          }),
          withCredentials: true
      };
      return this.http.put<string>(this.chatUrl + '/status', room, httpOptions).pipe();
  }
}

