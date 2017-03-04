import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormControl, FormBuilder, FormGroup, Validators }  from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { TennistatService } from '../../services/tennistat.service';
import { NavigationService } from '../../services/navigation.service';
@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.css']
})
export class PasswordresetComponent implements OnInit {
    uid: string;
    token: string;
    resetForm: FormGroup;
    passwordError: string;

  constructor(private route: ActivatedRoute,
                private fb: FormBuilder,
                private router: Router,
                private authService: AuthService,
                private tennistatService: TennistatService,
                private navigationService: NavigationService) { }

  ngOnInit() {
      this.navigationService.setActiveSection("services");
      this.uid = this.route.snapshot.params['uid'];
      this.token = this.route.snapshot.params['token'];
      this.createResetForm();
  }

  createResetForm(){
      // Here we are using the FormBuilder to build out our form.
      this.resetForm = this.fb.group({
            uid:[this.uid],
            token:[this.token],
            new_password1: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
            new_password2: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
        });
    }

  onSubmit(){
      let passwordmatch: boolean;

      this.passwordError = "";

      //console.log(this.registrationForm.value.user.password1);
      passwordmatch = (this.resetForm.value.new_password1 == this.resetForm.value.new_password2)
      if (!passwordmatch){
          this.passwordError = "The two password fields didn't match.";
          return
      }
      this.authService.passwordResetConfirm(this.resetForm.value)
            .subscribe( res => { this.router.navigate(['login']) },
                        err => {
                                this.passwordError = "Unable to reset your password."
                               });
  }
}
