import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../services/navigation.service';

@Component({
  selector: 'app-home-anonym',
  templateUrl: './home-anonym.component.html',
  styleUrls: ['./home-anonym.component.css']
})
export class HomeAnonymComponent implements OnInit {

  tennistatLogoUrl = "assets/img/tennishots_logo.svg";

  constructor(private navigationService: NavigationService) { }

  ngOnInit() {
      this.navigationService.setActiveSection("");
  }

}
