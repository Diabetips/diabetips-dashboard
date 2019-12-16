import { Component, OnInit, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Patient } from '../patients-service/patient';
import { PatientsService } from '../patients-service/patients.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  email: any;
}

@Component({
  selector: 'app-invite-patient',
  templateUrl: 'invite-patient.html'
})
export class InvitePatientComponent {

  constructor(
    public dialogRef: MatDialogRef<InvitePatientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
@Component({
  selector: 'app-main-navigation',
  templateUrl: './main-navigation.component.html',
  providers: [PatientsService],
  styleUrls: ['./main-navigation.component.css']
})
export class MainNavigationComponent implements OnInit {
  patients: Patient[] = [];
  editPatient: Patient;
  isMe = true;
  selectedProfile: any;
  newProfile: any;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private patientsService: PatientsService,
    public dialog: MatDialog
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

    switchPatient(uid: any, isMe: boolean): void {
      if (isMe) {
        this.patientsService.getMe()
          .subscribe(patient => {
            this.selectedProfile = patient;
            this.newProfile = {email: patient.email, first_name: patient.first_name, last_name: patient.last_name};
          });
        this.isMe = isMe;
      } else {
        this.patientsService.getPatient(uid)
          .subscribe(patient => {
            this.selectedProfile = patient;
            this.newProfile = {email: patient.email, first_name: patient.first_name, last_name: patient.last_name};
            console.log(this.selectedProfile)
            console.log(this.newProfile)
          });
        this.isMe = isMe;
      }
    }

    invitePatient(): void {
      const dialogRef = this.dialog.open(InvitePatientComponent, {
        width: '50%',
        data: {email: ''}
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
      });
    }

    deletePatient(patient: Patient): void {
      this.patients = this.patients.filter(h => h !== patient);
      this.patientsService
        .deletePatient(patient.uid)
        .subscribe();
    }
  }
