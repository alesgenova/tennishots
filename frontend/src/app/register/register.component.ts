import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators }  from '@angular/forms';

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

  registrationForm = new FormGroup ({
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
});

  constructor() { }

  ngOnInit() {
      this.armChoices = ARM_CHOICES;
      this.unitChoices = UNIT_CHOICES;
      this.backhandChoices = BACKHAND_CHOICES;
      this.privacyChoices = PRIVACY_CHOICES;
  }

  onSubmit(){
      
  }

}
