import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { AuthHttp } from 'angular2-jwt';

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

}
