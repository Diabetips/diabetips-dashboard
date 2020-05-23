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
  selector: 'app-confirm-deletion',
  templateUrl: 'confirm-deletion.html',
  styleUrls: ['../app.component.css']
})
export class ConfirmDeletionComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmDeletionComponent>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

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
  providers: [],
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

  public bsChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    legend: { display: false }
  };

  public bsChartLabels = [];
  public bsChartType = 'line';
  public bsChartLegend = true;
  public bsChartData = [{
    data: [],
    backgroundColor: "rgba(53, 191, 246, 0.425)",
    borderColor: "#4DCEFF",
    pointBackgroundColor: "#fff",
    pointBorderColor: "#4DCEFF",
    pointRadius: 5,
    pointHitRadius: 12,
  }];

  public hbChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    legend: { display: false }
  };

  public hbChartLabels = [];
  public hbChartType = 'line';
  public hbChartLegend = true;
  public hbChartData = [{
    data: [],
    backgroundColor: "#00000000",
    borderColor: "#4DCEFF",
    pointBackgroundColor: "#fff",
    pointBorderColor: "#4DCEFF",
    pointRadius: 12,
    pointHitRadius: 12,
  }];

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
        this.userInfo.hba1c = hba1c;
        this.hbChartLabels = []
        this.hbChartData[0].data = []
        hba1c.reverse().forEach(measure => {
          this.hbChartLabels.push(this.timestampAsDate(measure.timestamp))
          this.hbChartData[0].data.push(measure.value)
        });
      });
      this.patientsService.getPatientBs(this.uid).subscribe(blood_sugar => {
        this.userInfo.blood_sugar = blood_sugar
        this.bsChartLabels = []
        this.bsChartData[0].data = []
        blood_sugar.reverse().forEach(measure => {
          this.bsChartLabels.push(this.timestampAsDate(measure.timestamp))
          this.bsChartData[0].data.push(measure.value)
        });
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

  saveChanges(): void {
    this.patientsService.updateGeneralBiometrics(this.userInfo.uid, parseInt(this.userInfo.biometrics.height), parseInt(this.userInfo.biometrics.mass))
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

  timestampFromNow(ts: number) {
    var a = new Date(ts * 1000);
    return moment(a).fromNow();
  }

  timestampAsDate(ts: number) {
    var a = new Date(ts * 1000);
    return moment(a).format('DD/MM/YYYY h:mm')
  }

  deleteConnection(): void {
    const dialogRef = this.dialog.open(ConfirmDeletionComponent, {
      width: '25%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirm) {
        this.patientsService
          .deleteConnection(this.patientsService.connectedId, this.userInfo.uid);
      }
    });
  }
}
