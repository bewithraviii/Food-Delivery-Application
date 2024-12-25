// import { Injectable } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import { ModalController } from '@ionic/angular';
// import { DialogPage } from 'src/app/pages/member/user/shared/dialog/dialog.page';

// @Injectable({
//   providedIn: 'root'
// })
// export class DialogService {

//   constructor(
//     private matDialog: MatDialog, 
//     private modalController: ModalController
//   ) { }

//   async openDialog(title: string, contentTemplate: any, contextData: any, isMobile: boolean) {
//     if(isMobile){
//       const modal = await this.modalController.create({
//         component: DialogPage,
//         componentProps: { title, contentTemplate, contextData }
//       });
//       return await modal.present();
//     } else {
//       const dialogRef = this.matDialog.open(DialogPage, {
//         data: { title, contentTemplate, contextData },
//         width: '400px',
//       });
//       return dialogRef.afterClosed();
//     }
//   }
// }
