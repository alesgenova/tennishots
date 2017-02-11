import { Component, OnInit } from '@angular/core';
//import { loggedIn } from './shared/profile.global';
import { AuthService } from './services/auth.service';
import { TennistatService } from './services/tennistat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public Profile = Object({});
/*        username: "",
        first_name: "",
        last_name: "",
        arm: "",
        units: "",
        backhand: "",
        privacy: "",
        friends: []
    });*/
  loggedIn: boolean = false;

  constructor(private authService:AuthService, private tennistatService:TennistatService){}

  ngOnInit(){
      
  }
}
