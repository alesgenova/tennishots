import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormControl, FormBuilder, FormGroup, Validators }  from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { TennistatService } from '../../services/tennistat.service';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent implements OnInit {

  emailForm: FormGroup;
  emailError: string;
  submitted: boolean = false;

  constructor(private fb: FormBuilder,
                private router: Router,
                private authService: AuthService,
                private tennistatService: TennistatService) { }

  ngOnInit() {
      this.createEmailForm();
  }

  createEmailForm(){
      // Here we are using the FormBuilder to build out our form.
      this.emailForm = this.fb.group({
            email: ['', Validators.compose([Validators.required])],
        });
    }

  onSubmit(){
      let passwordmatch: boolean;
      this.emailError = "";
      this.authService.passwordResetEmail(this.emailForm.value)
            .subscribe( res => { this.submitted = true; },
                        err => {
                                let theError:any = err.json();
                                this.emailError = "Please enter a valid email."
                               });
  }

}
