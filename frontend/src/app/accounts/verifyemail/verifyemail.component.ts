import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { TennistatService } from '../../services/tennistat.service';
import { NavigationService } from '../../services/navigation.service';
@Component({
  selector: 'app-verifyemail',
  templateUrl: './verifyemail.component.html',
  styleUrls: ['./verifyemail.component.css']
})
export class VerifyemailComponent implements OnInit {
    key: string;
    verifyError: string = "";

  constructor(private route: ActivatedRoute,
                private router: Router,
                private authService: AuthService,
                private tennistatService: TennistatService,
                private navigationService: NavigationService) { }

  ngOnInit() {
      this.navigationService.setActiveSection("services");
      this.key = this.route.snapshot.params['key'];
      if (this.key != ""){
          this.onVerifyEmail();
      }
  }

  onVerifyEmail(){
      this.authService.verifyEmail(this.key)
            .subscribe( res => { console.log(res)},//this.router.navigate(['login']) },
                        err => {
                                this.verifyError = "Email has already been verified."
                               });
  }
}
