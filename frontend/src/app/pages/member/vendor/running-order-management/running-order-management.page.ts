import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { jwtDecode } from 'jwt-decode';
import { firstValueFrom } from 'rxjs';
import { ORDER_STATUS } from 'src/app/enums/enum';
import { updateOrderFromVendor } from 'src/app/models/api.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { NotificationService } from 'src/app/services/snack-notification/notification.service';
import { SocketService } from 'src/app/services/socket/socket.service';

@Component({
  selector: 'app-running-order-management',
  templateUrl: './running-order-management.page.html',
  styleUrls: ['./running-order-management.page.scss'],
})
export class RunningOrderManagementPage implements OnInit {

  ELEMENT_DATA: {orderId: string, item: any, status: string, date: string, note: string | null}[] = [];

  dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
  displayedColumns: string[] = ['orderId', 'date', 'item', 'status', 'action', 'note' ];

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  runningOrderCount: number = 0;
  restaurantId: any;
  activeToastCount: number = 0;


  constructor(
    private router: Router,
    private apiService: ApiService,
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
    await this.populateTable();
    this.runningOrderCount = this.ELEMENT_DATA.length;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async proceedToDelivery(orderId: string) {
    await this.presentLoader('Processing...');
    try {
      const approveOrderPayload: updateOrderFromVendor = {
        orderId: orderId,
        restaurantId: this.restaurantId,
        status: ORDER_STATUS.OUT_FOR_DELIVERY
      }
      const updatedOrderData: any = await firstValueFrom(this.apiService.updateOrderRequest(approveOrderPayload));
      if(updatedOrderData){
        if(updatedOrderData.payload.updated) {
          this.ELEMENT_DATA = this.ELEMENT_DATA.filter(item => item.orderId !== orderId);
          this.dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
        }
      }
      this.dismissLoader();
      if(this.ELEMENT_DATA.length == 0){
        this.runningOrderCount = 0;
        this.router.navigate(['/vendor-dashboard/console']);
      } else {
        this.runningOrderCount = this.ELEMENT_DATA.length
      }
    }
    catch(error: any) {
      this.dismissLoader();
        this.notificationService.notifyUser("errorSnack", error.error.message);
        console.log(error);
    }
  }

  async populateTable() {
    try{
      const response: any = await firstValueFrom(this.apiService.getActiveOrders());
      if (response && response.payload) {
        response.payload.forEach((element: any) => {
          this.ELEMENT_DATA.push(
            { 
              date: element.date, 
              orderId: element.orderId, 
              item: element.item, 
              status: element.status,
              note: element.note
            });
          this.dataSource.data = this.ELEMENT_DATA;
        });
        console.log(this.ELEMENT_DATA);
      }
    }catch(err){
      console.error('Error fetching order received details', err);
    }
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
