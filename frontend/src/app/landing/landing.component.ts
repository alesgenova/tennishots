import { Component, OnInit } from '@angular/core';

import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  constructor(private profileService:ProfileService) { }

  ngOnInit() {
    this.profileService.checkLastChanges();
  }

}
