import { Component, OnInit, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Patient } from '../patients-service/profile-classes';
import { PatientsService } from '../patients-service/patients.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';

import { DOCUMENT } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { parse } from 'querystring';

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

  constructor(public dialogRef: MatDialogRef<ConfirmDeletionComponent>) { }

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
  token;
  myRoute

  signinUrl = 'http://api.diabetips.fr/v1/auth/authorize?response_type=token&redirect_uri=http://localhost:4200';
  isLoading = true;

  constructor(
    @Inject(DOCUMENT) private document: Document, 
    private breakpointObserver: BreakpointObserver,
    private patientsService: PatientsService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.myRoute = route
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(
    map(result => result.matches)
  );

  async ngOnInit() {
    await this.getToken(this.myRoute)
    this.patientsService.getMe().subscribe(me => {
      this.me = me;
      this.getPictureForProfile(this.me)
      this.getConnections();
    });
  }

  getConnections(): void {
    this.patientsService.getConnections(this.me.uid)
      .subscribe(patients => {
        this.patients = patients;
        this.patients.forEach(patient => {
          this.getPictureForProfile(patient)
        });
      });
  }

  async getToken(route) {
    this.token = await localStorage.getItem('token');
    if (!this.token) {
      await this.getTokenFromUrl(route)
    }

    if (this.token !== null && this.token !== undefined) {
      localStorage.setItem('token', this.token);
      this.isLoading = false
      this.router.navigate(['']);
    } else {
      this.document.location.href = this.signinUrl;
    }
  }

  async getTokenFromUrl(route: ActivatedRoute) {
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
      this.token = parsedFragment.get('access_token')
    });
  }

  getPictureForProfile(profile: Patient) {
    this.patientsService.getPatientPicture(profile.uid).subscribe(picture => {
      let reader = new FileReader();
      reader.addEventListener("load", () => {
        //profile.profile_picture = reader.result
      }, false);

      if (picture) {
        reader.readAsDataURL(picture);
      }
    })
  }

  signOut(): void {
    localStorage.removeItem('token');
    this.ngOnInit();
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
      width: '25%'
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
