import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-dummy',
  templateUrl: './dummy.component.html',
  styleUrls: ['./dummy.component.css']
})
export class DummyComponent implements OnInit {

  requestedUser: string;

  constructor(private route: ActivatedRoute,
              private router: Router,) { }

  ngOnInit() {
    this.requestedUser = this.route.snapshot.params['user'];
    this.router.navigate(['/summary',this.requestedUser])
  }

}
