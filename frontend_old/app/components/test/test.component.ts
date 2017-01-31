import { Component } from '@angular/core';
import { TestService } from '../../services/test.service';

@Component({
  moduleId: module.id,
  selector: 'test-api',
  template: '{{ api_response.user }}',
})
export class TestComponent  {
    api_response: any;
    constructor(private _testService:TestService){
        this._testService.get_funct().subscribe( res => {
            this.api_response = res ;
            console.log(res)
        });
    }
}
