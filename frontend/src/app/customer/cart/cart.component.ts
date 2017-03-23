import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ProfileService } from '../../services/profile.service';
import { NavigationService } from '../../services/navigation.service';
import { TennistatService } from '../../services/tennistat.service';

import { Order } from '../../objects/customer';
import { CustomerProfile } from '../../objects/customer';

import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  myUsername: string;
  freeTrial: boolean = false;
  acknowledge: boolean = false;
  customerProfile: CustomerProfile;
  customerProfileSubscription: Subscription;
  order = new Order();

  constructor(private router: Router,
              private profileService: ProfileService,
              private tennistatService: TennistatService,
              private navigationService: NavigationService) { }

  ngOnInit() {
    this.navigationService.setActiveSection("services");
    this.myUsername = this.profileService.getUsername();

    this.customerProfileSubscription = this.profileService.customerProfile$
      .subscribe(profile => {
          this.customerProfile = profile;
          this.freeTrial = ( new Date().valueOf() < new Date(this.customerProfile.trial_end).valueOf() );
      });
  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.customerProfileSubscription.unsubscribe();
  }

  onAcknowledge(){
    if (this.acknowledge){
      this.acknowledge = false;
      this.order = new Order();
    }else{
      this.acknowledge = true;
      if (!this.freeTrial){
        this.tennistatService.get_unpaid_order(this.myUsername)
              .subscribe(order => {
                this.order = order;
              });
      }
    }
  }

}
