import { Component, OnInit } from '@angular/core';
import { Patient } from '../patients-service/patient';
import { PatientsService } from '../patients-service/patients.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  providers: [PatientsService],
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  me: any;
  patients: Patient[] = [];
  token: string = localStorage.getItem('token');

  constructor(
    private patientsService: PatientsService,
  ) {
    this.patientsService.getMe().subscribe(patient => this.me = patient);
  }

  ngOnInit() { }
}
