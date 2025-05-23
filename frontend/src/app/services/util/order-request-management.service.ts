import { Injectable } from '@angular/core';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root'
})
export class OrderRequestManagementService {

  constructor(
    private socketService: SocketService,
  ) { }
}
