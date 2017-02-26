import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-csvupload',
  templateUrl: './csvupload.component.html',
  styleUrls: ['./csvupload.component.css']
})
export class CsvuploadComponent implements OnInit {

  uploaded: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  onBeforeSend(event) {
      event.xhr.setRequestHeader('Authorization', 'JWT ' + localStorage.getItem("id_token"));
  }

  onUpload(event){
      this.uploaded = true;
  }

}
