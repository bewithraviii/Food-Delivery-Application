import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AddressExtractionService {
  private readonly ADDRESSES_KEY = 'savedAddresses';
  addresses = signal<any[]>(this.getAddresses());
  
  constructor() { }


  extractAddressDetails(address: string) {
    const addressDetails = {
      shopNumber: this.extractShopNumber(address),
      floor: this.extractFloor(address),
      buildingName: this.extractBuildingName(address),
      landmark: this.extractLandmark(address),
      city: this.extractCity(address),
      state: this.extractState(address),
      pincode: this.extractPincode(address)
    };
    return addressDetails;
  }

  private extractShopNumber(address: string): string | null {
    const shopNumberMatch = address.match(/Shop No\.\s*(\d+)/i);
    return shopNumberMatch ? shopNumberMatch[1] : null;
  }

  private extractFloor(address: string): string | null {
    const floorMatch = address.match(/(\d+)(?:st|nd|rd|th)\s*floor/i);
    return floorMatch ? floorMatch[0] : null;
  }

  private extractBuildingName(address: string): string | null {
    const buildingMatch = address.match(/(?:,\s*)([^,]+)(?:,\s*opp\.|,\s*near)/i);
    return buildingMatch ? buildingMatch[1].trim() : null;
  }

  private extractLandmark(address: string): string | null {
    const landmarkMatch = address.match(/(?:opp\.|near)\s*([^,]+)/i);
    return landmarkMatch ? landmarkMatch[1].trim() : null;
  }

  private extractCity(address: string): string | null {
    const cityMatch = address.match(/,\s*([A-Za-z\s]+),\s*Gujarat/i);
    return cityMatch ? cityMatch[1].trim() : null;
  }

  private extractState(address: string): string {
    return 'Gujarat';
  }

  private extractPincode(address: string): string | null {
    const pincodeMatch = address.match(/\b\d{6}\b/);
    return pincodeMatch ? pincodeMatch[0] : null;
  }

  setAddresses(newAddresses: any) {
    this.addresses.set(newAddresses);
    localStorage.setItem(this.ADDRESSES_KEY, JSON.stringify(newAddresses));
  }

  getAddresses(): any[] {
    const saved = localStorage.getItem(this.ADDRESSES_KEY);
    return saved ? JSON.parse(saved) : [];
    // return this.addresses();
  }

}
