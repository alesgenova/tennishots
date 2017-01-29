import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class PeriodListService{
    private username:string;
    private periodname:string;

    constructor(private _http:Http){
        console.log('PeriodListService is ready...');
        this.username = 'ales';
        this.periodname = 'months';
    }

    get_periods(){
        return this._http.get('http://localhost:8000/api/'+this.username+'/'+this.periodname+'/')
                .map(res => res.json());
    }

}
