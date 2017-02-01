import { Component, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service'

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  _login:boolean = false
  _loggedin:boolean = false
  constructor(private authService: AuthService) { }

  ngOnInit() {
      this.onLogin()
      this.test_loggedin();
  }

  onLogin(){
      this.authService.login("ales","pass1234").
        subscribe( res => {
            this._login=res;
        });
  }

  test_loggedin(){
      this._loggedin = this.authService.loggedIn();
  }

}
