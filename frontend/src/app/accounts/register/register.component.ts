import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormBuilder, FormGroup, Validators }  from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { TennistatService } from '../../services/tennistat.service';
import { ARM_CHOICES, BACKHAND_CHOICES, UNIT_CHOICES, PRIVACY_CHOICES } from '../../objects/registration';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  armChoices = ARM_CHOICES;
  unitChoices = UNIT_CHOICES;
  backhandChoices = BACKHAND_CHOICES;
  privacyChoices = PRIVACY_CHOICES;

  passwordError: string = "";
  usernameError: string = "";
  emailError: string = "";

  registrationForm: FormGroup;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private tennistatService: TennistatService,
              private router: Router) {
      this.createRegistrationForm();
  }

  ngOnInit() {

  }

  createRegistrationForm(){
      // Here we are using the FormBuilder to build out our form.
      this.registrationForm = this.fb.group({
        user: this.fb.group({
            username: ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(20)])],
            password1: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
            password2: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
            email: ['',Validators.required]
        }),
        profile: this.fb.group({
            first_name: ['',Validators.required],
            last_name: '',
            arm: "R",
            units: "M",
            backhand: "2",
            privacy: "VF"
        })
      });
  }

  onSubmit(){
      var success: boolean;
      let passwordmatch: boolean;

      this.usernameError = "";
      this.emailError = "";
      this.passwordError = "";

      //console.log(this.registrationForm.value.user.password1);
      passwordmatch = (this.registrationForm.value.user.password1 == this.registrationForm.value.user.password2)
      if (!passwordmatch){
          this.passwordError = "The two password fields didn't match."
          return
      }
      this.authService.register(this.registrationForm.value.user)
            .subscribe( res => {
                                console.log(res);
                                if (typeof res.token != "undefined") {
                                    localStorage.setItem('username', res.user.username);
                                    localStorage.setItem('id_token', res.token);
                                    success = true;
                                    //console.log("Registration Success");
                                    this.tennistatService.create_profile(this.registrationForm.value.profile)
                                          .subscribe( res => { localStorage.setItem('userProfile', JSON.stringify(res)) } );
                                    //console.log("Userprofile Success");
                                    this.router.navigate(['landing'])
                                }
                               },
                        err => {
                                //console.log("error!!")
                                //console.log(err.json());
                                let theError:any = err.json()
                                if (typeof theError.username != "undefined") {
                                    this.usernameError = theError.username[0]
                                }
                                if (typeof theError.email != "undefined") {
                                    this.emailError = theError.email[0]
                                }
                                success = false;
                               });
      if (success){

      }
  }

}
