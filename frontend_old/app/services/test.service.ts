import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class TestService{
    //private username:string;
    //private periodname:string;

    constructor(private _http:Http){
        console.log('TestService is ready...');
        //this.username = 'ales';
        //this.periodname = 'months';
    }

    get_funct(){
        return this._http.get('http://localhost:8000/api/test/')
                .map(res => res.json());
    }

}
