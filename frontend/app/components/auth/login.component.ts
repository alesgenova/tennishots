import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

interface Credentials {
  username: string,
  password: string
}

@Component({
  selector: 'login',
  template: `
    <form #f="ngForm" (ngSubmit)="onLogin(f.value)" *ngIf="!auth.loggedIn()">
      <input type="text" placeholder="username" ngControl="username">
      <input type="password" placeholder="password" ngControl="password">
      <button type="submit">Submit</button>
    </form>
  `
})

export class LoginComponent {

  credentials: Credentials;

  constructor(private auth: AuthService) {}

  onLogin(credentials:string) {
    this.auth.login(credentials);
  }
}
