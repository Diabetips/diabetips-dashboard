import { Component, OnInit, Input } from '@angular/core';
import { Patient } from '../patients-service/patient';

import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { PatientsService } from '../patients-service/patients.service';
import { getSyntheticPropertyName } from '@angular/compiler/src/render3/util';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  providers: [PatientsService],
  styleUrls: ['./patient-detail.component.css']
})
export class PatientDetailComponent implements OnInit {
  @Input() patient: Patient;

  constructor(
    private route: ActivatedRoute,
    private patientsService: PatientsService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.getPatient();
  }

  getPatient(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.patientsService.getPatient(id)
      .subscribe(patient => this.patient = patient);
  }

  goBack(): void {
    this.location.back();
  }

}
