import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalController } from '@ionic/angular';
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

}
