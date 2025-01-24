import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-custom-deal-dialog',
  templateUrl: './custom-deal-dialog.page.html',
  styleUrls: ['./custom-deal-dialog.page.scss'],
})
export class CustomDealDialogPage implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<CustomDealDialogPage>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  deals: any;
  selectedDeal: any;

  ngOnInit() {
    if(this.data){
      this.deals = {...this.data.deals, showTerms: false};
      this.selectedDeal = this.data.couponApplied ? this.deals : null;
    } else {
      this.deals = [];
    }
  }

  applyDeal(deal: any): void {
    this.dialogRef.close(deal);
  }

  closeDialog(): void {
    this.dialogRef.close(null);
  }

  toggleVisible(deal: any): void {
    deal.showTerms = !deal.showTerms;
  }
}
