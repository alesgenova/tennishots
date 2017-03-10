import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ProfileService } from '../services/profile.service';
import { TennistatService } from '../services/tennistat.service';
import { NavigationService } from '../services/navigation.service';

import { SONY_STROKES_CHOICES } from '../objects/strokes';

import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
    userChoices: any;
    myUsername: string;
    activeUser: string;
    requestedUser: string;
    userProfile: any;
    userChoicesSubscription: Subscription;
    playerProfiles: any;
    playerProfilesSubscription: Subscription;
    playerSummaries: any;
    playerSummariesSubscription: Subscription;
    userProfileSubscription: Subscription;
    chartData: any;
    SONY_STROKES_CHOICES = SONY_STROKES_CHOICES;

    overallPieData: number[];
    pieLabels: string[];

    public pieOptions:any = {
      circumference: Math.PI,
      rotation:Math.PI,
      responsive: true
    }

    public chartOptions:any = {
      scaleShowVerticalLines: true,
      responsive: true,
      scales: {
        yAxes: [{
          position: "left",
          "id": "y-axis-0",
          gridLines:{display:false},
          ticks: {
                    fixedStepSize: 400,
                    beginAtZero: true
                }
        }, {
          position: "right",
          "id": "y-axis-1",
          gridLines:{display:false},
          ticks: {
                    fixedStepSize: 1,
                    beginAtZero: true
                }
        }],
          xAxes: [{
              gridLines:{display:true}
                  }],
              },
    };
    public chartType:string = 'line';
    public chartLegend:boolean = true;

    public chartColors:Array<any> = [
    { // grey
      pointRadius: 5,
      //borderColor: 'rgba(245,85,54,0.8)',//"#C9302C"
      borderColor: 'rgba(169,68,66,0.8)',
      backgroundColor: 'rgba(245,85,54,0.0)',
    },
    { // grey
      pointRadius: 5,
      //borderColor: 'rgba(32,164,243,0.8)', //"#025AA5"
      borderColor: 'rgba(49,112,143,0.8)',
      backgroundColor: 'rgba(32,164,243,0.0)'
    }
  ]

  constructor(private route: ActivatedRoute,
                private router: Router,
                private profileService: ProfileService,
                private tennistatService: TennistatService,
                private navigationService: NavigationService) { }

  ngOnInit() {
      this.navigationService.setActiveSection("summary");
      this.myUsername = this.profileService.getUsername();
      this.requestedUser = this.route.snapshot.params['user'];

      this.userProfileSubscription = this.profileService.userProfile$
        .subscribe(profile => {
            this.userProfile = profile;
            if (this.requestedUser == null){
                this.activeUser = this.myUsername;
            }
            if (this.requestedUser != this.myUsername){
                if (this.userProfile.friends.some(x=>x.user==this.requestedUser)){
                    this.activeUser = this.requestedUser;
                }else{
                    this.activeUser = this.myUsername;
                }
            }
        });

      // subscribe to changes in the player profiles
      this.playerProfilesSubscription = this.profileService.playerProfiles$
        .subscribe(profiles => {
          this.playerProfiles = profiles;
          this.fromUserToData();
        });

      // subscribe to changes in the user choices
      this.userChoicesSubscription = this.profileService.userChoices$
        .subscribe(choices => {
          this.userChoices = choices;
        });

      // subscribe to changes in the user choices
      this.playerSummariesSubscription = this.profileService.playerSummaries$
        .subscribe(summaries => {
          this.playerSummaries = summaries;
          this.fromUserToData();
      });

  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.playerProfilesSubscription.unsubscribe();
    this.playerSummariesSubscription.unsubscribe();
    this.userChoicesSubscription.unsubscribe();
    this.userProfileSubscription.unsubscribe();
  }

  fromUserToData(){
    this.chartData = new Object();

    let weekLabels = [];
    let weekShotCount = [];
    let weekSessionCount = [];
    let playerProfile = this.playerProfiles[this.activeUser];
    let nWeeks = playerProfile.periods.week.length;
    let itermax = 0
    if (nWeeks > 12){
      itermax = 12;
    }else{
      itermax = nWeeks;
    }
    for (let i = 1;i<=itermax;i++){
      weekLabels.push(playerProfile.periods.week[nWeeks-i].timestamp);
      weekShotCount.push(playerProfile.periods.week[nWeeks-i].shot_count);
      weekSessionCount.push(playerProfile.periods.week[nWeeks-i].session_count);
    }
    this.chartData['labels'] = weekLabels;
    this.chartData['datasets'] = [];
    this.chartData['datasets'].push({
      label: "Shots",
      fill: "false",
      yAxisID: "y-axis-0",
      data: weekShotCount
    });
    this.chartData['datasets'].push({
      label: "Sessions",
      fill: "false",
      yAxisID: "y-axis-1",
      data: weekSessionCount
    });
    this.overallPieData= [];
    this.pieLabels = [];
    for (let stroke of this.SONY_STROKES_CHOICES){
      this.pieLabels.push(stroke.label);
      this.overallPieData.push(this.playerSummaries[this.activeUser][stroke.key].count_overall);
    }
  }

}
