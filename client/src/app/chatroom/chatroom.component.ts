import { PreloaderComponent } from './../preloader/preloader.component';
import { ChatroomService } from './chatroom.service';
import { AuthorizationService } from './../authorization/authorization.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { IMessage, IUserData, IRooms } from './message.interface';


@Component({
    selector: 'app-chatroom',
    templateUrl: './chatroom.component.html',
    styleUrls: ['./chatroom.component.scss']
})

export class ChatroomComponent implements OnInit {

  rooms:IRooms[] = [];
  roomName:string = '' ;
  currentRoomName = "";
  error = false;
  newMessage: string = '';
  messageList: IMessage[] = [];

  userData:IUserData = {
      user: '',
      userid: ''
  }

  constructor(
      public authService: AuthorizationService,
      private router: Router,
      private chatservice: ChatroomService,
      private preloader: PreloaderComponent,
  ) { }

  ngOnInit(): void {
      this.userData.user = localStorage.getItem('login');
      this.userData.userid = this.authService.userId; //need a fix because don't render lock button
      this.getAllRooms();

      //this string create stream
      this.chatservice.getNewMessage().subscribe(
          (message) => {
              if(!message) return;
              this.messageList.push(message);
          }
      );
  }

  sendMessage(){
      if(this.newMessage.length === 0 || this.chatservice.activeRoom.status === true) return;
      this.chatservice.sendMessage(this.newMessage);
      this.newMessage = '';
      this.getAllRooms();
  }

  logout(){
      this.authService.logout();
      this.router.navigate(['/login']);
  }

  joinToTheRoom(name:string, roomId:string, status:boolean){
      this.chatservice.activeRoom.roomId = roomId;
      this.chatservice.activeRoom.status = status;
      this.chatservice.activeRoom.name = name;
      this.currentRoomName = name;
      this.chatservice.joinTheRoom(name,roomId);
  }

  getAllRooms(){
      this.chatservice.getRooms().subscribe(
          res => {
              this.rooms = res;
          }
      );
  }

  getMessages(roomId:string){
      this.chatservice.getMessagesByRoomId(roomId).subscribe(
          res => {
              this.messageList = res;
          }
      );
  }

  createRoom(){
      if(this.roomName === '' || this.roomName.length < 2) {
          this.error = true;
          return;
      }
      if(this.preloader.isLoading === false) {
          this.preloader.isLoading = true;
          this.chatservice.createRoom(this.roomName).subscribe((res) =>{
              this.rooms.push(res);
              this.roomName = '';
              this.error = false;
              this.chatservice.activeRoom.roomId = res.room_id;
              this.getAllRooms();
              this.preloader.isLoading = false;
          });
      }
  }

  deleteRoom(roomId:string){
      if(confirm("Are you sure?")){
          if(this.preloader.isLoading === false){
              this.preloader.isLoading = true;
              this.chatservice.deleteRoomById(roomId).subscribe();
          }
          this.rooms = this.rooms.filter((room) => room.room_id !== roomId);
          this.preloader.isLoading = false;
      }
  }

  deleteMessage(messageId:string){
      if(confirm("Are you sure?")){
          if(this.preloader.isLoading === false){
              this.preloader.isLoading = true;
              this.chatservice.deleteMessageById(messageId).subscribe();
          }
          this.messageList = this.messageList.filter((message) => message.messageid !== messageId);
          this.preloader.isLoading = false;
      }
  }

  closeRoom(roomId:string, createrId:string){
      if(createrId !== this.userData.userid) return;
      if(confirm("are you sure?")){
          if(this.preloader.isLoading === false){
              this.preloader.isLoading = true;
              this.chatservice.closeRoomById(roomId).subscribe(
                  ()=> {
                      this.preloader.isLoading === false;
                      this.rooms = this.rooms.filter((room) => room.room_id !== roomId);
                  }
              );
          }
      }
  }
}
