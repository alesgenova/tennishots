import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Headers, RequestOptions, Response } from '@angular/http';
import { AuthHttp } from 'angular2-jwt';

import { ProfileForm } from '../objects/registration';
import { SonyFilter } from '../objects/sonyfilter';

import 'rxjs/add/operator/map';

@Injectable()
export class TennistatService {

  ApiUrl: string = 'http://localhost:8000/api/'

  constructor(private http: Http, private authHttp: AuthHttp) { }
//headerPrefix?: string;
  get_test(){
    return this.authHttp
        .get(this.ApiUrl+'test/')
        .map(res => res.json());
  }

  post_test(){
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      let name:string = "carrr"
      return this.authHttp
          .post(this.ApiUrl+'test/',{name}, options)
          .map(res => res.json());
  }

  get_csrftoken(){

      return this.http
          .get(this.ApiUrl+'csrf/')
          .map(res => res.json());
  }

  get_periods(username:string, period:string){
      return this.authHttp
          .get(this.ApiUrl+username+'/'+period+'/')
          .map(res => res.json());
  }

  get_filter_stats(filter:SonyFilter){
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      return this.authHttp
          .post(this.ApiUrl+'shotsfilter/',filter, options)
          .map(res => res.json());
  }

  get_friends(){
      return this.authHttp
          .get(this.ApiUrl+'friends/')
          .map(res => res.json());
  }

  get_profile(){
      return this.authHttp
          .get(this.ApiUrl+'profile/')
          .map(res => res.json());
  }

  create_profile(profileForm:ProfileForm){
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      return this.authHttp.post(this.ApiUrl+'profile/',profileForm, options)
          .map((response: Response) => {return response.json()} );
  }

  update_profile(profileForm:ProfileForm){
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      return this.authHttp.put(this.ApiUrl+'profile/',profileForm, options)
          .map((response: Response) => {return response.json()} );
  }

  get_friendrequests(){
      return this.authHttp
          .get(this.ApiUrl+'friendrequests/')
          .map(res => res.json());
  }

 respond_friendrequest(from_user:string, to_user:string, action:string){
     let headers = new Headers({ 'Content-Type': 'application/json' });
     let options = new RequestOptions({ headers: headers });
     return this.authHttp.post(this.ApiUrl+'friendrequests/',{from_user:from_user, to_user:to_user, action:action}, options)
         .map((response: Response) => {return response.json()} );
 }

  add_friend(from_user:string, to_user:string){
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      return this.authHttp.post(this.ApiUrl+'addfriend/',{from_user:from_user, to_user:to_user}, options)
          .map((response: Response) => {return response.json()} );
  }

  search_user(query: string){
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      return this.authHttp.post(this.ApiUrl+'searchuser/',{query:query}, options)
          .map((response: Response) => {return response.json()} );
  }

}
