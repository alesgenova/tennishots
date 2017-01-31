import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { tokenNotExpired } from 'angular2-jwt';

import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {

    public token: string;
    ApiUrl: string = 'http://localhost:8000/rest-auth/'

    constructor(private http: Http) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = currentUser && currentUser.token;
    }

    login(username:string, password:string): Observable<boolean>{
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        return this.http.post(this.ApiUrl+'login/',JSON.stringify({ username: username, password: password }), options)
            .map((response: Response) => {
                console.log(response)
                // login successful if there's a jwt token in the response
                let token = response.json() && response.json().token;
                if (token) {
                    // set token property
                    this.token = token;

                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    //localStorage.setItem('currentUser', JSON.stringify({ username: username, id_token: token }));
                    localStorage.setItem('username', username);
                    localStorage.setItem('id_token', token);

                    // return true to indicate successful login
                    return true;
                } else {
                    // return false to indicate failed login
                    return false;
                }
            });
    }

    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        //localStorage.removeItem('currentUser');
        localStorage.removeItem('id_token');
        localStorage.removeItem('username');
    }

    loggedIn() {
        return tokenNotExpired();
}

}
