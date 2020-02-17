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
  selector: 'app-options',
  templateUrl: './options.component.html',
  providers: [PatientsService],
  styleUrls: ['./options.component.css']
})
export class OptionsComponent implements OnInit {
  userInfo: Diabetolog;
  newProfile: Diabetolog;
  isMe: boolean;

  token: string = localStorage.getItem('token');
  editing: boolean = false;
  
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
  
  editProfile(): void {
    this.editing = !this.editing;
  }

  saveChanges(): void {
    this.patientsService.updatePatient(this.newProfile, this.userInfo.uid)
      .subscribe(resp => {
        this.userInfo = resp;
        this.newProfile = resp
      });
    this.editProfile();
  }
}