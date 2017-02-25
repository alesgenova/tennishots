import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
      if (this.loggedIn()){
          this.router.navigate(['home'])
      }
  }

  loggedIn(){
      //console.log("loggedIn check")
      return this.authService.loggedIn()
  }
}
