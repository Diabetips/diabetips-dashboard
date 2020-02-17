import { Component, OnInit, Input, Inject, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, ViewChildren } from '@angular/core';
import { Patient } from '../patients-service/profile-classes';
import { PatientsService } from '../patients-service/patients.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { $ } from 'protractor';
import * as moment from 'moment';
import { Chart } from 'chart.js';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';

export interface DialogData {
  email: any;
  first_name: any;
  last_name: any;
}

moment.locale('fr')

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  providers: [PatientsService],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  userInfo: Patient;
  newProfile: Patient;
  isMe: boolean;

  // FIX: REFRESH NOT WORKING ANYMORE
  @Output() refreshPatients = new EventEmitter();

  token: string = localStorage.getItem('token');
  uid: string;
  editing: boolean = false;
  
  @ViewChild('myChart', { static: false }) myChart;

  constructor( private patientsService: PatientsService, public dialog: MatDialog, private route: ActivatedRoute ) {
    this.userInfo = new Patient
    this.newProfile = new Patient
  }

  async ngOnInit() {
    await this.getTokenFromUrl()
    this.patientsService.getPatient(this.uid)
      .subscribe(patient => {
        this.userInfo = patient;
        this.newProfile = patient;
      });
  }

  async getTokenFromUrl() {
    this.route.queryParams
      .subscribe(params => {
        // Get token from parsed fragment
        this.uid = params.patient
      });
  }

  ngAfterViewInit() {
    // var myChart = new Chart(this.myChart.nativeElement.getContext('2d'), {
    //   type: 'bar',
    //   data: {
    //       labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    //       datasets: [{
    //           label: '# of Votes',
    //           data: [12, 19, 3, 5, 2, 3],
    //           backgroundColor: [
    //               'rgba(255, 99, 132, 0.2)',
    //               'rgba(54, 162, 235, 0.2)',
    //               'rgba(255, 206, 86, 0.2)',
    //               'rgba(75, 192, 192, 0.2)',
    //               'rgba(153, 102, 255, 0.2)',
    //               'rgba(255, 159, 64, 0.2)'
    //           ],
    //           borderColor: [
    //               'rgba(255, 99, 132, 1)',
    //               'rgba(54, 162, 235, 1)',
    //               'rgba(255, 206, 86, 1)',
    //               'rgba(75, 192, 192, 1)',
    //               'rgba(153, 102, 255, 1)',
    //               'rgba(255, 159, 64, 1)'
    //           ],
    //           borderWidth: 1
    //       }]
    //   },
    //   options: {
    //       scales: {
    //           yAxes: [{
    //               ticks: {
    //                   beginAtZero: true
    //               }
    //           }]
    //       }
    //   }
    // });
  }

  editProfile(): void {
    this.editing = !this.editing;
  }

  saveChanges(): void {
    this.patientsService.updatePatient(this.newProfile, this.userInfo.uid)
      .subscribe(resp => {
        this.userInfo = resp;
        this.userInfo.hba1c = this.newProfile.hba1c
        this.userInfo.insulin = this.newProfile.insulin
        this.newProfile = resp;
        this.refreshPatients.emit();
      });
    this.editProfile();
  }

  timestampAsDate(ts: number) {
    var a = new Date(ts * 1000);
    return moment(a).fromNow();
  }
}
