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
  jsonPostOptions = new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/json' }) });

  constructor(private http: Http, private authHttp: AuthHttp) { }
//headerPrefix?: string;
  get_test(){
    return this.authHttp
        .get(this.ApiUrl+'test/')
        .map(res => res.json());
  }

  post_test(){
      let name:string = "carrr"
      return this.authHttp
          .post(this.ApiUrl+'test/',{name}, this.jsonPostOptions)
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

  get_recentactivity(){
      return this.authHttp
          .get(this.ApiUrl+'latestactivity/')
          .map(res => res.json());
  }

  get_filter_stats(filter:SonyFilter){
      return this.authHttp
          .post(this.ApiUrl+'shotsfilter/',filter, this.jsonPostOptions)
          .map(res => res.json());
  }

  get_friends(){
      return this.authHttp
          .get(this.ApiUrl+'friends/')
          .map(res => res.json());
  }

  get_tags(username:string){
      return this.authHttp
          .get(this.ApiUrl+username+'/labels/')
          .map(res => res.json());
  }

  create_tag(username:string, tagname:string, category:number){
      return this.authHttp
          .post(this.ApiUrl+username+'/labels/', {name:tagname, category:category}, this.jsonPostOptions)
          .map(res => res.json());
  }

  delete_tag(pk:number){
      return this.authHttp
          .delete(this.ApiUrl+'label/'+pk+'/',)
          .map(res => res.json());
  }

  assign_tag(tagPk:number, sessionPk:number, action:string){
      return this.authHttp
          .post(this.ApiUrl+'addsessionlabel/', {label_pk:tagPk, session_pk:sessionPk, action:action}, this.jsonPostOptions)
          .map(res => res.json());
  }

  get_profile(){
      return this.authHttp
          .get(this.ApiUrl+'profile/')
          .map(res => res.json());
  }

  create_profile(profileForm:ProfileForm){
      return this.authHttp.post(this.ApiUrl+'profile/',profileForm, this.jsonPostOptions)
          .map((response: Response) => {return response.json()} );
  }

  update_profile(profileForm:ProfileForm){
      return this.authHttp.put(this.ApiUrl+'profile/',profileForm, this.jsonPostOptions)
          .map((response: Response) => {return response.json()} );
  }

  get_friendrequests(){
      return this.authHttp
          .get(this.ApiUrl+'friendrequests/')
          .map(res => res.json());
  }

 respond_friendrequest(from_user:string, to_user:string, action:string){
     return this.authHttp.post(this.ApiUrl+'friendrequests/',{from_user:from_user, to_user:to_user, action:action}, this.jsonPostOptions)
         .map((response: Response) => {return response.json()} );
 }

  add_friend(from_user:string, to_user:string){
      return this.authHttp.post(this.ApiUrl+'addfriend/',{from_user:from_user, to_user:to_user}, this.jsonPostOptions)
          .map((response: Response) => {return response.json()} );
  }

  search_user(query: string){
      return this.authHttp.post(this.ApiUrl+'searchuser/',{query:query}, this.jsonPostOptions)
          .map((response: Response) => {return response.json()} );
  }

  get_progress(user:string, periodname:string, swing:string){
      return this.authHttp
          .get(this.ApiUrl+user+'/progress/'+periodname+'/'+swing)
          .map(res => res.json());
  }

}
