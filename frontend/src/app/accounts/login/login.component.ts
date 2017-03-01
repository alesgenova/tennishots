import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { FormControl, FormBuilder, FormGroup, Validators }  from '@angular/forms';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loginError: string = "";

  constructor(private authService: AuthService,
              private fb: FormBuilder,
              private profileService:ProfileService,
              private router: Router) {}

  ngOnInit() {
      this.createLoginForm();
  }

  createLoginForm(){
      this.loginForm = this.fb.group({
          username: ['', Validators.required],
          password: ['', Validators.required]
      });
  }

  onLogin(){
      this.authService.login2(this.loginForm.value.username, this.loginForm.value.password)
        .subscribe( res => {
                    if (typeof res.token != "undefined") {
                        localStorage.setItem('id_token', res.token);
                        localStorage.setItem('username', res.user.username);
                        this.profileService.initialize();
                        //this.profileService.refreshProfile();
                        //this.profileService.checkLastChanges();
                        this.router.navigate(['home']);
                        //setTimeout(() => this.router.navigate(['home']), 1250);
                    }
                            },
                    err => {
                        let theError:any = err.json()
                        if (typeof theError.non_field_errors != "undefined") {
                            this.loginError = theError.non_field_errors[0]
                        }
                    }
        );
  }

}
