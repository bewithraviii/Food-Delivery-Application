import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { loginRequest } from 'src/app/models/api.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private loginURL = environment.baseApiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  login(reqPayload: loginRequest): Observable<any> {
    return this.http.post<{token: string}>(`${this.loginURL}/login`, reqPayload); 
  }

}
