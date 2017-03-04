import { Component, OnInit } from '@angular/core';

import { Friend, FriendRequest } from '../objects/registration';
import { TennistatService } from  '../services/tennistat.service';
import { ProfileService } from  '../services/profile.service';
import { NavigationService } from '../services/navigation.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {

  userProfile: any;
  friends: Friend[] = [];
  friendRequests: FriendRequest[] = [];
  users: Friend[] = [];
  search: string = "";


  constructor(private tennistatService: TennistatService,
              private profileService: ProfileService,
              private router: Router,
              private navigationService: NavigationService) { }

  ngOnInit() {
      this.navigationService.setActiveSection("services");
      this.userProfile = this.profileService.getProfile();
      this.refreshFriends();
      this.refreshRequests();
  }

  refreshFriends() {
      this.tennistatService.get_friends()
            .subscribe( res => {
                this.userProfile.friends = res;
                localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
                this.friends = res;
            });
  }

  refreshRequests() {
      this.tennistatService.get_friendrequests()
            .subscribe( res => {
                //localStorage.setItem('userProfile.friends', JSON.stringify(res));
                this.friendRequests = res;
            });
  }

  searchUser(query:string){
      if (query.length > 2){
          console.log(query);
          this.tennistatService.search_user(query)
                .subscribe( res => {
                    this.users = res;
                });
      }else{
          this.users = []
      }
  }

  respondRequest(from_user: string, action: string){
      this.tennistatService.respond_friendrequest(from_user, this.userProfile.user, action)
            .subscribe( res => {
                //this.friends = [];
                //this.friendRequests = [];
                this.refreshFriends();
                this.refreshRequests();
            });
  }


  addFriend(to_user:string){

      this.tennistatService.add_friend( this.userProfile.user, to_user)
            .subscribe( res => {
                this.searchUser(this.search);
            });
  }

  onFriendClick(user:string){
      this.router.navigate(['summary',user]);
  }

}
