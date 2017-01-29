import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {
  api_server: string = 'http://localhost:8000/rest-auth/';
  constructor(private http: Http) {}

  login(credentials:string) {
    this.http.post(this.api_server+'login/', credentials)
      .map(res => res.json())
      .subscribe(
        // We're assuming the response will be an object
        // with the JWT on an id_token key
        data => localStorage.setItem('id_token', data.token),
        error => console.log(error)
      );
  }

}
