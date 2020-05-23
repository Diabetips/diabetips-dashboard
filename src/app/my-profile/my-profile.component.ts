import { Component, OnInit, Input, Inject, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, ViewChildren } from '@angular/core';
import { Diabetolog } from '../patients-service/profile-classes';
import { PatientsService } from '../patients-service/patients.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { $ } from 'protractor';
import * as moment from 'moment';
import { Chart } from 'chart.js';

export interface DialogData {
  email: any;
  first_name: any;
  last_name: any;
}

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  providers: [],
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
  userInfo: Diabetolog;
  newProfile: Diabetolog;
  isMe: boolean;

  token: string = localStorage.getItem('token');
  
  @ViewChild('myChart', { static: false }) myChart;

  constructor( private patientsService: PatientsService, public dialog: MatDialog ) {
    this.userInfo = new Diabetolog
    this.newProfile = new Diabetolog
  }

  async ngOnInit() {
    await this.patientsService.getMe()
      .subscribe(patient => {
        this.userInfo = patient;
        this.newProfile = patient;
      });
  }
}