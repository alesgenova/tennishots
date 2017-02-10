import { Component, OnInit } from '@angular/core';
import { FileSelectDirective, FileDropDirective, FileUploader } from 'ng2-file-upload/ng2-file-upload';

const URL = 'http://localhost:8000/api/testupload/';

@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.css']
  //authToken: 'JWT '+localStorage.getItem('id_token'),
})
export class FileuploadComponent implements OnInit {
  disabled:boolean = true;

  ngOnInit() {
  }

  onBeforeSend(event) {
      event.xhr.setRequestHeader('Authorization', 'JWT ' + localStorage.getItem("id_token"));
  }

}
