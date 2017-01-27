import { Component } from '@angular/core';
import { PeriodListService } from '../../services/periodlist.service';

@Component({
  moduleId: module.id,
  selector: 'period-list',
  templateUrl: 'periodlist.component.html',
})
export class PeriodListComponent  {
    constructor(private _periodlistService:PeriodListService){
        this._periodlistService.get_periods().subscribe( periods => console.log(periods));
    }

}
