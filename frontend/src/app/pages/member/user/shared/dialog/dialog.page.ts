import { Component, Inject, Injector, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.page.html',
  styleUrls: ['./dialog.page.scss'],
})
export class DialogPage implements OnInit {
  
  @Input() title: string = '';
  @Input() contentTemplate: any;
  @Input() contextData: any = {};

  constructor(
    private matDialogRef: MatDialogRef<DialogPage>,
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) {}

  ngOnInit() {
    this.title = this.data.title;
    this.contentTemplate = this.data.contentTemplate;
    this.contextData = this.data.contextData;
  }


  closeDialog() {
    this.matDialogRef.close();
  }

  saveChanges() {
    this.matDialogRef.close(this.contextData.user);
  }


}
