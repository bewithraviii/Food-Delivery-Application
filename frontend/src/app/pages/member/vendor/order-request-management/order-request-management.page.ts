import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SocketService } from '../../../../services/socket/socket.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { jwtDecode } from 'jwt-decode';
import { NotificationService } from 'src/app/services/snack-notification/notification.service';
import { updateOrderFromVendor } from 'src/app/models/api.interface';
import { ORDER_STATUS } from 'src/app/enums/enum';
import { Router } from '@angular/router';


@Component({
  selector: 'app-order-request-management',
  templateUrl: './order-request-management.page.html',
  styleUrls: ['./order-request-management.page.scss'],
})
export class OrderRequestManagementPage implements OnInit {

  ELEMENT_DATA: { orderId: string, date: string, item: any, status: string }[] = [];

  displayedColumns: string[] = ['orderId','date', 'item', 'status' ];
  dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  orderRequestCount: number = 0;
  restaurantId: any;
  
  // Counter to help determine the vertical offset for each toast notification
  activeToastCount: number = 0;
  
  constructor(
    private router: Router,
    private apiService: ApiService,
    private socketService: SocketService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private notificationService: NotificationService,
  ) { }

  async ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      this.restaurantId = decodedToken.id;
    }
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.socketService.listen(`newOrderNotification_${this.restaurantId}`, (data: any) => {
      console.log('Order Notification received:', data);
      this.ELEMENT_DATA.push(data);
      this.orderRequestCount = this.ELEMENT_DATA.length;
      this.dataSource.data = this.ELEMENT_DATA;
      this.showOrderApprovalNotification(data);
    });
    await this.populateTable();
    this.orderRequestCount = this.ELEMENT_DATA.length;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async approveRequest(elementId: string) {
    await this.presentLoader('Approving order...');
    try {
      const approveOrderPayload: updateOrderFromVendor = {
        orderId: elementId,
        restaurantId: this.restaurantId,
        status: ORDER_STATUS.PROCESSING
      }
      const updatedOrderData: any = await firstValueFrom(this.apiService.updateOrderRequest(approveOrderPayload));
      if(updatedOrderData){
        if(updatedOrderData.payload.updated) {
          this.ELEMENT_DATA = this.ELEMENT_DATA.filter(item => item.orderId !== elementId);
          this.dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
        }
      }
      this.dismissLoader();
      if(this.ELEMENT_DATA.length == 0){
        this.orderRequestCount = 0;
        this.router.navigate(['/vendor-dashboard/console']);
      } else {
        this.orderRequestCount = this.ELEMENT_DATA.length
      }
    } catch(error: any) {
        this.dismissLoader();
        this.notificationService.notifyUser("errorSnack", error.error.message);
        console.log(error);
    }
  }

  async rejectRequest(elementId: string) {
    await this.presentLoader('Cancelling order...');
    try {
      const rejectOrderPayload: updateOrderFromVendor = {
        orderId: elementId,
        restaurantId: this.restaurantId,
        status: ORDER_STATUS.CANCELLED
      }
      const updatedOrderData: any = await firstValueFrom(this.apiService.updateOrderRequest(rejectOrderPayload));
      if(updatedOrderData){
        if(updatedOrderData.payload.updated) {
          this.ELEMENT_DATA = this.ELEMENT_DATA.filter(item => item.orderId !== elementId);
          this.dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
        }
      }
      this.dismissLoader();
      if(this.ELEMENT_DATA.length == 0){
        this.orderRequestCount = 0;
        this.router.navigate(['/vendor-dashboard/console']);
      } else {
        this.orderRequestCount = this.ELEMENT_DATA.length
      }
    } catch(error: any) {
      this.dismissLoader();
      this.notificationService.notifyUser("errorSnack", error.error.message);
      console.log(error);
    }

  }


  async populateTable() {
    try{
      const response: any = await firstValueFrom(this.apiService.getOrderRequest());
      if (response && response.payload) {
        response.payload.forEach((element: any) => {
          this.ELEMENT_DATA.push({ date: element.date, orderId: element.orderId, item: element.item, status: element.status });
          this.dataSource.data = this.ELEMENT_DATA;
        });
        console.log(this.ELEMENT_DATA);
      }
    }catch(err){
      console.error('Error fetching order received details', err);
    }
  }

  async showOrderApprovalNotification(data: any) {
    const offset = this.activeToastCount * 60;

    // const itemsHtml = data.item.map((item: any) => `
    //   <div><strong>${item.name}</strong> × ${item.quantity}</div>
    // `).join('');

    // const messageTemplate = `
    //   <div class="toast-template">
    //     <div><strong>New Order #${data.orderId}</strong></div>
    //     ${itemsHtml}
    //   </div>
    // `;

    const toast = await this.toastController.create({
      message: `New Order #${data.orderId} received`,
      position: 'top',
      buttons: [
        {
          text: 'Accept',
          role: 'accept',
          handler: () => {
            this.approveRequest(data.orderId);
          }
        },
        {
          text: 'Decline',
          role: 'decline',
          handler: () => {
            this.rejectRequest(data.orderId);
          }
        }
      ],
      cssClass: 'order-toast'
    });

    this.activeToastCount++;

    await toast.present();

    setTimeout(async () => {
      const toastEl = document.querySelector('ion-toast:last-of-type') as HTMLIonToastElement;;
      if (toastEl) {
        toastEl.style.top = `${offset}px`;
      }
    }, 50);

    // When the toast is dismissed, decrease the counter.
    toast.onDidDismiss().then(() => {
      this.activeToastCount--;
      // Optionally, you could recalculate styles for other toasts here if you need to re-stack.
    });

  }

  async presentLoader(message?: string) {
    const loader = await this.loadingController.create({
      message: message,
      spinner: 'lines',
      backdropDismiss: false,
    });
    await loader.present();
  }
  
  async dismissLoader() {
    await this.loadingController.dismiss();
  }

}
