import { Component, OnInit, Input, Inject, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { Patient } from '../patients-service/profile-classes';
import { PatientsService } from '../patients-service/patients.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { $ } from 'protractor';
import * as moment from 'moment';
import { Chart } from 'chart.js';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { resolve } from 'url';

export interface DialogData {
  email: any;
  first_name: any;
  last_name: any;
}

function trackByFn(index, item) {
  console.log(index)
  return index;
}

moment.locale('fr')

@Component({
  selector: 'app-display-meals',
  templateUrl: 'display-meals.html'
})
export class DisplayMealsComponent {

  constructor(
    public dialogRef: MatDialogRef<DisplayMealsComponent>,
    @Inject(MAT_DIALOG_DATA) public meal: any) { }

  ngOnInit() { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  timestampAsDate(ts: number) {
    var a = new Date(ts * 1000);
    return moment(a).format('Do MMMM YYYY, hh:mm:ss');
  }
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  providers: [PatientsService],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userInfo: Patient;
  newProfile: Patient;
  isMe: boolean;

  public selectedData = 'bloodsugar'

  token: string = localStorage.getItem('token');
  uid: string;
  editing: boolean = false;
  
  @ViewChild('myChart', { static: false }) myChart;

  constructor(
    private patientsService: PatientsService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
  ) {
    this.userInfo = new Patient
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.uid = params.patient

      this.patientsService.getPatient(this.uid).subscribe(patient => {
        this.userInfo.uid = patient.uid;
        this.userInfo.email = patient.email;
        this.userInfo.first_name = patient.first_name;
        this.userInfo.last_name = patient.last_name;
      });
      this.patientsService.getPatientHb(this.uid).subscribe(hba1c => {
        if (hba1c) {
          this.userInfo.hba1c = hba1c;
        } else {
          this.userInfo.hba1c = [];
        }
      });
      this.patientsService.getPatientBs(this.uid).subscribe(blood_sugar => {
        this.userInfo.blood_sugar = blood_sugar
      });
      this.patientsService.getPatientInsulin(this.uid).subscribe(insulin => {
        this.userInfo.insulin = insulin;
      });
      this.patientsService.getPatientMeals(this.uid).subscribe(meals => {
        this.userInfo.meals = meals;
      });
      this.patientsService.getPatientBiometrics(this.uid).subscribe(biometrics => {
        this.userInfo.biometrics = biometrics;
      })
      this.userInfo.profile_picture = this.patientsService.getPatientPicture(this.uid)
    })
  }

  editProfile(): void {
    this.editing = !this.editing;
  }

  displayMeals(meal: any): void {
    const dialogRef = this.dialog.open(DisplayMealsComponent, {
      width: '40%',
      data: {meal: meal}
    });
  }

  timestampAsDate(ts: number) {
    var a = new Date(ts * 1000);
    return moment(a).fromNow();
  }
}
