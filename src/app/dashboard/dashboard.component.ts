import { Component, OnInit, Input, Inject, Output, EventEmitter } from '@angular/core';
import { Patient } from '../patients-service/patient';
import { PatientsService } from '../patients-service/patients.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { $ } from 'protractor';

export interface DialogData {
  email: any;
  first_name: any;
  last_name: any;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  providers: [PatientsService],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @Input() userInfo: any;
  @Input() newProfile: any;
  @Input() isMe: boolean;

  @Output() refreshPatients = new EventEmitter();

  token: string = localStorage.getItem('token');
  editing: boolean = false;

  constructor(
    private patientsService: PatientsService,
    public dialog: MatDialog ) {
  }

  ngOnInit() {
    this.userInfo = {email: "ph", first_name: "ph", last_name: "ph"}
    this.newProfile = {email: "ph", first_name: "ph", last_name: "ph"}
    this.patientsService.getMe()
      .subscribe(patient => {
        this.userInfo = patient;
        this.newProfile = {email: patient.email, first_name: patient.first_name, last_name: patient.last_name};
      });
  }

  editProfile(): void {
    this.editing = !this.editing;
  }

  saveChanges(): void {
    this.patientsService.updatePatient(this.newProfile, this.userInfo.uid)
      .subscribe(resp => {
        this.userInfo = resp;
        this.newProfile = {email: resp.email, first_name: resp.first_name, last_name: resp.last_name};
        this.refreshPatients.emit();
      });
    this.editProfile();
  }

  timestampAsDate(ts: number) {
    var a = new Date(ts * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }
}

