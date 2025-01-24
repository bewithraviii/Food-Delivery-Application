import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalController } from '@ionic/angular';
import { CustomDealDialogPage } from 'src/app/pages/member/user/shared/custom-deal-dialog/custom-deal-dialog.page';
import { DialogPage } from 'src/app/pages/member/user/shared/dialog/dialog.page';

@Injectable({ providedIn: 'root' })
export class DialogService {

    constructor(
        private matDialog: MatDialog,
    ) {}

    async openDialog(title: string, contextData: any, fields: any, contentTemplate?: any, isConfirmationDialog?: boolean) {
        const dialogRef = this.matDialog.open(DialogPage, {
            data: { title, contentTemplate, fields, contextData, isConfirmationDialog },
            width: '500px',
        });
        return dialogRef.afterClosed().toPromise();
    }

    async dealsDialog(deals: any, couponApplied?: boolean){
        const dialogRef = this.matDialog.open(CustomDealDialogPage, {
            width: '500px',
            data: { deals: deals, couponApplied: couponApplied }
        });
        return dialogRef.afterClosed().toPromise();
    }

}
