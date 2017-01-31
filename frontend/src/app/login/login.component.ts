import { Component, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service'

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loggedin:boolean = false
  constructor(private authService: AuthService) { }

  ngOnInit() {
      this.login_test()
  }

  login_test(){
      this.authService.login("ales","pass1234").
        subscribe( res => {
            this.loggedin=res;
        });
  }

}
