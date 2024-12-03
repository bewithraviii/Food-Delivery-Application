import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private loginURL = 'http://localhost:3000/api/login';

  constructor(
    private http: HttpClient,
  ) { }

  login(reqPayload: any): Observable<any> {
    return this.http.post<{token: string}>(`${this.loginURL}`, reqPayload); 
  }

}
