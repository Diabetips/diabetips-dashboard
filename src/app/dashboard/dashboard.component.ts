import { Component, OnInit } from '@angular/core';
import { Patient } from '../patients-service/patient';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  patients: Patient[] = [];

  constructor() { }

  ngOnInit() {
    console.log(localStorage.getItem('token'));
  }

}
