import { Component, ElementRef, Inject, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { NotificationService } from 'src/app/services/snack-notification/notification.service';
import { ApiService } from 'src/app/services/api/api.service';
import * as L from 'leaflet';

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

  @ViewChild('map') mapContainer!: ElementRef;
  map!: L.Map;
  marker: any;
  mapErrorMessage: boolean = true;

  constructor(
    private matDialogRef: MatDialogRef<DialogPage>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private clipboard: Clipboard,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.resetData();
    this.title = this.data.title;
    this.contentTemplate = this.data.contentTemplate;
    this.contextData = this.data.contextData;
    this.fields = this.data.fields || [];
    this.isConfirmationDialog = this.data.isConfirmationDialog || false;
    if(!this.isConfirmationDialog && this.contextData.identity == 'form'){
      this.dialogForm = this.buildForm(this.fields);
    }
  }

  ngAfterViewInit() {
    if (this.contextData.type === 'map') {
      this.initMap();
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
    if (this.map) {
      this.map.remove();
    }
  }

  copyCouponToClipBoard(code: string) {
    const couponCode = code;
    if (couponCode) {
      this.clipboard.copy(couponCode);
      this.notificationService.notifyUser("successSnack", "Coupon code copied to clipboard!");
    }
  }

  async initMap() {
    // Default Location: TatvaSoft
    let defaultLat = 23.0347;
    let defaultLng = 72.5005;

    if (this.dialogForm && this.dialogForm.get('details') && this.dialogForm.get('details')?.value) {
      const address = this.dialogForm.get('details')?.value;
      this.apiService.getAddressLatAndLong(address).subscribe(
        (response: any) => {
          if (response && response.features && response.features.length > 0) {
            const coordinates = response.features[0].geometry.coordinates;
            defaultLat = coordinates[1];
            defaultLng = coordinates[0];
            this.initializeMapWithCoordinates(defaultLat, defaultLng);
          }
        },
        (error) => {
          console.error('Error geocoding address', error);
          this.initializeMapWithCoordinates(defaultLat, defaultLng);
          this.reverseGeocode(defaultLat, defaultLng);
        }
      );
    } else {
      this.initializeMapWithCoordinates(defaultLat, defaultLng)
      this.reverseGeocode(defaultLat, defaultLng);
    }
  }

  async initializeMapWithCoordinates(lat: number, lng: number) {
    // Create the map instance
    this.map = L.map(this.mapContainer.nativeElement).setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    // Place a draggable marker on the map
    this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
    this.marker.on('dragend', async() => {
      const position = this.marker.getLatLng();
      this.reverseGeocode(position.lat, position.lng);
    });

  }

  async reverseGeocode(lat: number, lng: number) {
    this.apiService.getLocationFromLatAndLong(lat, lng).subscribe(
      (response: any) => {
        if (this.dialogForm) {
          this.dialogForm.patchValue({ details: response.display_name });
        }
      },
      (error) => {
        console.error('Reverse geocoding error', error);
      }
    );
  }
  
}
