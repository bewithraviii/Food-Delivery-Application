import { Component, Inject, Injector, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { NotificationService } from 'src/app/services/snack-notification/notification.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.page.html',
  styleUrls: ['./dialog.page.scss'],
})
export class DialogPage implements OnInit {
  dialogForm!: FormGroup;
  fields: any;
  isConfirmationDialog: boolean = false;
  @Input() title: string = '';
  @Input() contentTemplate: any;
  @Input() contextData: any = {};

  constructor(
    private matDialogRef: MatDialogRef<DialogPage>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private clipboard: Clipboard,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.title = this.data.title;
    this.contentTemplate = this.data.contentTemplate;
    this.contextData = this.data.contextData;
    this.fields = this.data.fields || [];
    this.isConfirmationDialog = this.data.isConfirmationDialog || false;
    if(!this.isConfirmationDialog){
      this.dialogForm = this.buildForm(this.fields);
    }
  }

  ngOnDestroy() {
    this.resetData();
  }

  // Build the form dynamically
  private buildForm(fields: any[]): FormGroup {
    const formGroup: Record<string, AbstractControl> = {};
    fields.forEach((field) => {
      formGroup[field.name] = this.fb.control(field.value || '', field.validators || []);
    });
    return this.fb.group(formGroup);
  }

  closeDialog() {
    this.matDialogRef.close();
  }

  saveChanges() {
    if (this.dialogForm.valid) {
      this.matDialogRef.close(this.dialogForm.value);
    }
  }

  grantPermission(){
    this.matDialogRef.close('true');
  }

  resetData() {
    this.title = '';
    this.contentTemplate = null;
    this.contextData = {};
    if(this.dialogForm) {
      this.dialogForm.reset();
    }
  }

  copyCouponToClipBoard(code: string) {
    const couponCode = code;
    if (couponCode) {
      this.clipboard.copy(couponCode);
      this.notificationService.notifyUser("successSnack", "Coupon code copied to clipboard!");
    }
  }
}
