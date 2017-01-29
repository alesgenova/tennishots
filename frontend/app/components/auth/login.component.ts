import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { contentHeaders } from '../../common/headers';

//const styles   = require('./login.css');
//const template = require('./login.html');

@Component({
  moduleId: module.id,
  selector: 'login',
  templateUrl: 'login.component.html'
//  styles: [ styles ]
})
export class Login {
  constructor(public router: Router, public http: Http) {
  }

  login(event:any, username:string, password:string) {
    event.preventDefault();
    let body = JSON.stringify({ username, password });
    this.http.post('http://localhost:8000/rest-auth/login/', body, { headers: contentHeaders })
      .subscribe(
        response => {
          localStorage.setItem('id_token', response.json().id_token);
          this.router.navigate(['']);
        },
        error => {
          alert(error.text());
          console.log(error.text());
        }
      );
  }

  signup(event:any) {
    event.preventDefault();
    this.router.navigate(['signup']);
  }
}
