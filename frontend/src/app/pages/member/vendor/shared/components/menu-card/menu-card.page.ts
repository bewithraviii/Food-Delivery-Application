import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-menu-card',
  templateUrl: './menu-card.page.html',
  styleUrls: ['./menu-card.page.scss'],
})
export class MenuCardPage implements OnInit {



  @Input() menuItem: any;
  @Output() availabilityChange = new EventEmitter<any>();
  @Output() deleteItem = new EventEmitter<any>();
  

  constructor(
    private router: Router,
    private apiService: ApiService,
  ) { }

  async ngOnInit() {
  }

  editItem(id: any, subCategory: string){
    this.router.navigate([`vendor-dashboard/edit-menu-item/${id}`, { subCategory:  subCategory}]);
  }

  toggleAvailability(item: any, event: any, subCategory: string) {
    const toUpdatedValue = {
      available: event.checked
    }

    this.availabilityChange.emit({ item: {...item}, toUpdatedValue, subCategory: subCategory });
  }

  deleteMenuItem(itemId: number, subCategoryName: string, event: any) {
    const toDelete = {
      subCategoryName: subCategoryName,
      itemId: itemId
    }

    this.deleteItem.emit(toDelete);
  }


}
