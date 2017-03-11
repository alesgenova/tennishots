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
    mi2km = 1.60934;
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

    count_week: number = 0;
    count_overall: number = 0;


    overallPieData: any;
    weekPieData: any;
    opponentPieData: any;
    gamePieData: any;
    competitionPieData: any;
    surfacePieData: any;

    public pieOptions:any = {
      /*circumference: Math.PI,
      rotation:Math.PI,*/
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
    this.count_overall = 0;
    this.overallPieData = new Object();
    this.overallPieData['labels'] = [];
    this.overallPieData['datasets'] = [];
    this.overallPieData['datasets'].push(new Object());
    this.overallPieData['datasets'][0]['data'] = [];
    this.overallPieData['datasets'][0]['backgroundColor'] = [];
    this.overallPieData['datasets'][0]['hoverBackgroundColor'] = [];
    for (let stroke of this.SONY_STROKES_CHOICES){
      this.count_overall += this.playerSummaries[this.activeUser][stroke.key].count_overall;
      this.overallPieData['labels'].push(stroke.label)
      this.overallPieData['datasets'][0]['data'].push(this.playerSummaries[this.activeUser][stroke.key].count_overall);
      this.overallPieData['datasets'][0]['backgroundColor'].push(stroke.bgColor);
      this.overallPieData['datasets'][0]['hoverBackgroundColor'].push(stroke.bgColor);
    }
    this.count_week = 0;
    this.weekPieData = new Object();
    this.weekPieData['labels'] = [];
    this.weekPieData['datasets'] = [];
    this.weekPieData['datasets'].push(new Object());
    this.weekPieData['datasets'][0]['data'] = [];
    this.weekPieData['datasets'][0]['backgroundColor'] = [];
    this.weekPieData['datasets'][0]['hoverBackgroundColor'] = [];
    for (let stroke of this.SONY_STROKES_CHOICES){
      this.count_week += this.playerSummaries[this.activeUser][stroke.key].count_week;
      this.weekPieData['labels'].push(stroke.label)
      this.weekPieData['datasets'][0]['data'].push(this.playerSummaries[this.activeUser][stroke.key].count_week);
      this.weekPieData['datasets'][0]['backgroundColor'].push(stroke.bgColor);
      this.weekPieData['datasets'][0]['hoverBackgroundColor'].push(stroke.bgColor);
    }
    // Opponent tag piechart
    this.opponentPieData = new Object();
    this.opponentPieData['labels'] = [];
    this.opponentPieData['datasets'] = [];
    this.opponentPieData['datasets'].push(new Object());
    this.opponentPieData['datasets'][0]['data'] = [];
    for (let label of playerProfile.labels){
      if (label.category == 1 && label.session_count > 0){
        this.opponentPieData['labels'].push(label.name);
        this.opponentPieData['datasets'][0]['data'].push(label.session_count);
      }
    }

    // Game tag piechart
    this.gamePieData = new Object();
    this.gamePieData['labels'] = [];
    this.gamePieData['datasets'] = [];
    this.gamePieData['datasets'].push(new Object());
    this.gamePieData['datasets'][0]['data'] = [];
    for (let label of playerProfile.labels){
      if (label.category == 2 && label.session_count > 0){
        this.gamePieData['labels'].push(label.name);
        this.gamePieData['datasets'][0]['data'].push(label.session_count);
      }
    }

    // Competitive tag piechart
    this.competitionPieData = new Object();
    this.competitionPieData['labels'] = [];
    this.competitionPieData['datasets'] = [];
    this.competitionPieData['datasets'].push(new Object());
    this.competitionPieData['datasets'][0]['data'] = [];
    for (let label of playerProfile.labels){
      if (label.category == 3 && label.session_count > 0){
        this.competitionPieData['labels'].push(label.name);
        this.competitionPieData['datasets'][0]['data'].push(label.session_count);
      }
    }

    // Surface tag piechart
    this.surfacePieData = new Object();
    this.surfacePieData['labels'] = [];
    this.surfacePieData['datasets'] = [];
    this.surfacePieData['datasets'].push(new Object());
    this.surfacePieData['datasets'][0]['data'] = [];
    for (let label of playerProfile.labels){
      if (label.category == 0 && label.session_count > 0){
        this.surfacePieData['labels'].push(label.name);
        this.surfacePieData['datasets'][0]['data'].push(label.session_count);
      }
    }
  }

  getFastest(stroke:string, period:string){
    let imperial_units = (this.userProfile.units == "M");
    let fastest = 0;
    if (period == 'week'){
      fastest = this.playerSummaries[this.activeUser][stroke].fastest_week;
    }else if (period == 'overall'){
      fastest = this.playerSummaries[this.activeUser][stroke].fastest_overall;
    }
    if (fastest == -1){
      return "N/A"
    }
    if (imperial_units){
      return Math.round(fastest/this.mi2km) + " mi/h"
    }else{
      return fastest + " km/h"
    }
  }

  getAbove(stroke:string, period:string){
    let count = 0;
    let total = 0;
    if (period == 'week'){
      count = this.playerSummaries[this.activeUser][stroke].above_week;
      total = this.playerSummaries[this.activeUser][stroke].count_week;
    }else if (period == 'overall'){
      count = this.playerSummaries[this.activeUser][stroke].above_overall;
      total = this.playerSummaries[this.activeUser][stroke].count_overall;
    }
    if (count == -1){
      return "N/A"
    }
    return count+" shots <br> (" + Math.round(count/total*100) + "%)"
  }

  getAboveLabel(stroke:string){
    let imperial_units = (this.userProfile.units == "M");
    let threshold = 0;
    if (stroke == 'FH'){
      threshold = 105;
    }else if (stroke == 'BH'){
      threshold = 105;
    }else if (stroke == 'SE'){
      threshold = 145;
    }
    if (imperial_units){
      return Math.round(threshold/this.mi2km) + " mi/h"
    }else{
      return threshold + " km/h"
    }
  }


}
