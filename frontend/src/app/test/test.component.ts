import { Component, OnInit } from '@angular/core';
import { TennistatService } from '../services/tennistat.service';

@Component({
  selector: 'test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  user_get: string
  user_post: string

  constructor(private tennistatService: TennistatService) { }

  ngOnInit() {
      //this.acquire_csrf();
      this.get_test();
      this.post_test();
      this.get_periods();
  }

  acquire_csrf(){
      this.tennistatService.get_csrftoken().subscribe();
  }

  get_test(){
      this.tennistatService.get_test()
        .subscribe(data=>{
            this.user_get = data.user;
            console.log(data);
        });
  }

  post_test(){
      this.tennistatService.post_test()
        .subscribe(data=>{
            this.user_post = data.user;
            console.log(data);
        });
  }

  get_periods(){

      this.tennistatService.get_periods(localStorage["username"], "weeks")
        .subscribe(data=>{
            //this.user_get = data.user;
            console.log(data);
    });
  }

}
