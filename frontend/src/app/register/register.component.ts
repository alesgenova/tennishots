import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators }  from '@angular/forms';

import { AuthService } from '../services/auth.service';
import { ARM_CHOICES, BACKHAND_CHOICES, UNIT_CHOICES, PRIVACY_CHOICES } from '../objects/registration';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  armChoices: any[];
  unitChoices: any[];
  backhandChoices: any[];
  privacyChoices: any[];

  passwordError: string = "";
  usernameError: string = "";
  emailError: string = "";

  registrationForm: FormGroup;/* ({
      first_name: new FormControl("", Validators.required),
      last_name: new FormControl(""),
      username: new FormControl("", Validators.required),
      password1: new FormControl("", Validators.required),
      password2: new FormControl("", Validators.required),
      email: new FormControl("", Validators.required),
      arm: new FormControl("R"),
      units: new FormControl("M"),
      backhand: new FormControl("2"),
      privacy: new FormControl("VF")
});*/

  constructor(private fb: FormBuilder, private authService: AuthService) {
      this.createRegistrationForm();
  }

  ngOnInit() {
      this.armChoices = ARM_CHOICES;
      this.unitChoices = UNIT_CHOICES;
      this.backhandChoices = BACKHAND_CHOICES;
      this.privacyChoices = PRIVACY_CHOICES;
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

      console.log(this.registrationForm.value.user.password1);
      passwordmatch = (this.registrationForm.value.user.password1 == this.registrationForm.value.user.password2)
      if (!passwordmatch){
          this.passwordError = "The two password fields didn't match."
          return
      }
      this.authService.register(this.registrationForm.value)
            .subscribe( res => {
                                console.log(res);
                                if (typeof res.token != "undefined") {
                                    localStorage.setItem('username', res.user.username);
                                    localStorage.setItem('id_token', res.token);
                                    success = true;
                                    console.log("Registration Success");
                                    this.authService.createprofile(this.registrationForm.value)
                                          .subscribe( res => { console.log(res) });
                                    console.log("Userprofile Success");
                                }
                               },
                        err => {
                                console.log("error!!")
                                console.log(err.json());
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
