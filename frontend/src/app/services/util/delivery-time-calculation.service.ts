import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeliveryTimeCalculationService {

  constructor(
    private apiService: ApiService
  ) { }

  getCoords(address: string): Observable<{ lat: number, lng: number }> {
    return this.apiService.getAddressLatAndLong(address).pipe(
      map((response: any) => {
        if (response && response.features && response.features.length > 0) {
          const coordinates = response.features[0].geometry.coordinates;
          return { lat: coordinates[1], lng: coordinates[0] };
        }
        throw new Error("No coordinates found for address: " + address);
      }),
      catchError(error => {
        console.error("Error fetching coordinates for address:", address, error);
        return throwError(error);
      })
    );
  }
  
  calculateDeliveryTime(restaurantAddress: string, destination: string): Observable<number> {
    return this.getCoords(restaurantAddress).pipe(
      switchMap(restaurantCoords => 
        this.getCoords(destination).pipe(
          switchMap(destinationCoords => {
            const start = `${restaurantCoords.lng},${restaurantCoords.lat}`;
            const end = `${destinationCoords.lng},${destinationCoords.lat}`;
            return this.apiService.getDistanceTrackTime(start, end).pipe(
              map((response: any) => {
                const travelTimeInSeconds = response.features[0].properties.summary.duration;
                const travelTimeInMinutes = travelTimeInSeconds / 60;
                return +travelTimeInMinutes.toFixed(0);
              })
            );
          })
        )
      )
    );
  }

}
