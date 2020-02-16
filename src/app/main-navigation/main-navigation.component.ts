import { Component, OnInit, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Patient } from '../patients-service/patient';
import { PatientsService } from '../patients-service/patients.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';

import { DOCUMENT } from '@angular/common';
import { HttpParams } from '@angular/common/http';

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
  selector: 'app-confirm-deletion',
  templateUrl: 'confirm-deletion.html',
  styleUrls: ['../app.component.css']
})

export class ConfirmDeletionComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeletionComponent>,
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
  me: Patient = new Patient;

  signinUrl = 'http://api.diabetips.fr/v1/auth/authorize?response_type=token&redirect_uri=http://localhost:4200/home';
  token = undefined;
  isLoading = true;

  constructor(
    @Inject(DOCUMENT) private document: Document, 
    private breakpointObserver: BreakpointObserver,
    private patientsService: PatientsService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.getToken(route);
    if (this.token !== null && this.token !== undefined) {
      localStorage.setItem('token', this.token);
      this.isLoading = false
      this.router.navigate([{outlets: { primary: 'home' }}]);
    } else {
      this.document.location.href = this.signinUrl;
    }
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(
    map(result => result.matches)
  );

  ngOnInit() {
    this.patientsService.getMe().subscribe(me => {
      this.me = me;
      this.getPictureForProfile(this.me)
      this.getConnections();
    });
  }

  getToken(route: ActivatedRoute) {
    route.fragment.subscribe((fragment: string) => {
      if (!fragment) {
        return null;
      }

      // Init and fill parsed fragment
      let parsedFragment = new HttpParams();
      fragment.split('&').forEach((fragmentBit => {
        const fragmentBitArray = fragmentBit.split('=');
        parsedFragment = parsedFragment.set(fragmentBitArray[0], fragmentBitArray[1]);
      }));

      // Get token from parsed fragment
      this.token = parsedFragment.get('access_token');
    });
  }

  getConnections(): void {
    this.patientsService.getConnections(this.me.uid)
      .subscribe(patients => {
        this.patients = patients;
        this.patients.forEach(patient => {
          this.getPictureForProfile(patient)
          this.getPatientsHba1c(patient)
          this.getPatientsInsulin(patient)
        });
      });
  }

  getPictureForProfile(profile: Patient) {
    this.patientsService.getPatientPicture(profile.uid).subscribe(picture => {
      let reader = new FileReader();
      reader.addEventListener("load", () => {
        profile.profile_picture = reader.result
      }, false);

      if (picture) {
        reader.readAsDataURL(picture);
      }
    })
  }

  getPatientsHba1c(profile: Patient) {
    this.patientsService.getPatientHb(profile.uid).subscribe(measures => {
      profile.hba1c = measures
    })
  }

  getPatientsInsulin(profile: Patient) {
    this.patientsService.getPatientInsulin(profile.uid).subscribe(measures => {
      profile.insulin = measures
    })
  }

  switchPatient(selectedPatient: Patient, isMe: boolean): void {
    if (isMe) {
      this.patientsService.getMe()
        .subscribe(patient => {
          this.selectedProfile = patient;
          this.newProfile = {email: patient.email, first_name: patient.first_name, last_name: patient.last_name};
        });
      this.isMe = isMe;
    } else {
      this.patientsService.getPatient(selectedPatient.uid)
        .subscribe(patient => {
          this.selectedProfile = patient;
          this.newProfile = {email: patient.email, first_name: patient.first_name, last_name: patient.last_name, hba1c: selectedPatient.hba1c, insulin: selectedPatient.insulin};
        });
      this.isMe = isMe;
    }
  }

  invitePatient(): void {
    const dialogRef = this.dialog.open(InvitePatientComponent, {
      width: '40%',
      data: {email: ''}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.email) {
        this.patientsService.invitePatient(result.email, this.me.uid);
      }
    });
  }

  deleteConnection(patient: Patient): void {
    const dialogRef = this.dialog.open(ConfirmDeletionComponent, {
      width: '25%',
      data: {email: ''}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirm) {
        this.patients = this.patients.filter(h => h !== patient);
        this.patientsService
          .deleteConnection(this.me.uid, patient.uid);
      }
    });
  }
}
