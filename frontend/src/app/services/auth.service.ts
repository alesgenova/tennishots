import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthHttp } from 'angular2-jwt';
import { Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { tokenNotExpired } from 'angular2-jwt';

import { UserForm } from '../objects/registration';

import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {

    public token: string;
    jsonPostOptions = new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/json' }) });
    ApiUrl: string = 'https://api.tennishots.com/rest-auth/'
    ApiUrl2: string = 'https://api.tennishots.com/api/'
    //ApiUrl: string = 'http://localhost:8000/rest-auth/'
    //ApiUrl2: string = 'http://localhost:8000/api/'

    constructor(private http: Http, private authHttp: AuthHttp) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    login(username:string, password:string): Observable<boolean>{
        return this.http.post(this.ApiUrl+'login/',JSON.stringify({ username: username, password: password }), this.jsonPostOptions)
            .map((response: Response) => {
                console.log(response)
                // login successful if there's a jwt token in the response
                let token = response.json() && response.json().token;
                if (token) {
                    // set token property
                    this.token = token;

                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    //localStorage.setItem('currentUser', JSON.stringify({ username: username, id_token: token }));
                    //localStorage.setItem('username', username);
                    localStorage.setItem('id_token', token);

                    // return true to indicate successful login
                    return true;
                } else {
                    // return false to indicate failed login
                    return false;
                }
            });
    }

    login2(username:string, password:string){
        return this.http.post(this.ApiUrl+'login/',JSON.stringify({ username: username, password: password }), this.jsonPostOptions)
            .map( (response: Response) => response.json() );
    }

    register(userForm:UserForm){
        return this.http.post(this.ApiUrl+'registration/',userForm, this.jsonPostOptions)
            .map( (response: Response) => response.json() );
    }

    passwordResetEmail(emailForm:any){
        return this.http.post(this.ApiUrl+'password/reset/',emailForm, this.jsonPostOptions)
            .map( (response: Response) => response.json() );
    }

    passwordResetConfirm(resetForm:any){
        return this.http.post(this.ApiUrl+'password/reset/confirm/',resetForm, this.jsonPostOptions)
            .map( (response: Response) => response.json() );
    }

    verifyEmail(key:string){
        return this.http.post(this.ApiUrl+'registration/verify-email/',{key:key}, this.jsonPostOptions)
            .map( (response: Response) => response.json() );
    }

    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        localStorage.clear();
        //localStorage.removeItem('currentUser');

        //localStorage.removeItem('id_token');
        //localStorage.removeItem('userProfile');
        //localStorage.removeItem('playerProfile');

        //localStorage.removeItem('username');
    }

    loggedIn() {
        return tokenNotExpired();
    }

}
