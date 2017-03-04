import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../services/navigation.service';

@Component({
  selector: 'app-csvupload',
  templateUrl: './csvupload.component.html',
  styleUrls: ['./csvupload.component.css']
})
export class CsvuploadComponent implements OnInit {

  uploaded: boolean = false;

  constructor(private navigationService: NavigationService) { }

  ngOnInit() {
    this.navigationService.setActiveSection("services");
  }

  onBeforeSend(event) {
      event.xhr.setRequestHeader('Authorization', 'JWT ' + localStorage.getItem("id_token"));
  }

  onUpload(event){
      this.uploaded = true;
  }

}
