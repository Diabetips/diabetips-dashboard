import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Patient } from '../patients-service/patient';
import { PatientsService } from '../patients-service/patients.service';

@Component({
  selector: 'app-main-navigation',
  templateUrl: './main-navigation.component.html',
  providers: [PatientsService],
  styleUrls: ['./main-navigation.component.css']
})
export class MainNavigationComponent implements OnInit {
  patients: Patient[] = [];
  editPatient: Patient;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private patientsService: PatientsService
  ) {}

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

    ngOnInit() {
      this.getPatients();
    }

    getPatients(): void {
      this.patientsService.getPatients()
        .subscribe(patients => {
          this.patients = patients;
          this.patientsService.getMe().subscribe(me => {
            this.patients = this.patients.filter((value, index, array) => {
              return value.uid !== me.uid;
            });
          });
        });
    }

    add(first_name: string): void {
      this.editPatient = undefined;
      first_name = first_name.trim();
      if (!first_name) {
        return;
      }

      // The server will generate the id for this new patient
      const newPatient: Patient = { first_name } as Patient;
      this.patientsService
        .addPatient(newPatient)
        .subscribe(patient => this.patients.push(patient));
    }

    delete(patient: Patient): void {
      this.patients = this.patients.filter(h => h !== patient);
      this.patientsService
        .deletePatient(patient.uid)
        .subscribe();
    }

    edit(patient: Patient) {
      this.editPatient = patient;
    }

    search(searchTerm: string) {
      this.editPatient = undefined;
      if (searchTerm) {
        this.patientsService
          .searchPatient(searchTerm)
          .subscribe(patients => (this.patients = patients));
      }
    }

    update() {
      if (this.editPatient) {
        this.patientsService
          .updatePatient(this.editPatient)
          .subscribe(patient => {
          // replace the patient in the patients list with update from server
          const ix = patient ? this.patients.findIndex(h => h.uid === patient.uid) : -1;
          if (ix > -1) {
            this.patients[ix] = patient;
          }
        });
        this.editPatient = undefined;
      }
    }
  }
