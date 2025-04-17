import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  private serverUrl = 'http://localhost:3005';

  constructor() { 
    this.socket = io(this.serverUrl);
  }


  emit(eventName: string, data: any) {
    console.log('Emitting event:', eventName, data); 
    this.socket.emit(eventName, data);
  }

  listen(eventName: string, callBack:(data:any) => void){
    console.log('Listening for event:', eventName);
    this.socket.on(eventName, (data: any) => {
      callBack(data);
    });
  }

  disconnect() {
    if(this.socket){
      this.socket.disconnect();
    }
  }

}
