import { Component, OnInit } from '@angular/core';

import { ProfileService } from '../services/profile.service';
import { NavigationService } from '../services/navigation.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  constructor(private profileService:ProfileService,
              private navigationService: NavigationService) { }

  ngOnInit() {
    this.navigationService.setActiveSection("services");
    this.profileService.checkLastChanges();
  }

}
