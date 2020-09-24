import { Component, OnInit, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Patient } from '../patients-service/profile-classes';
import { PatientsService } from '../patients-service/patients.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';

import { DOCUMENT } from '@angular/common';
import { HttpParams } from '@angular/common/http';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export interface DialogData {
  email: any;
}
@Component({
  selector: 'app-invite-patient',
  templateUrl: 'invite-patient.html',
  styleUrls: ['../dashboard/dashboard.component.css']
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
  providers: [],
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
  searchText: string = "";

  signinUrl = 'http://api.diabetips.fr/v1/auth/authorize'
    + '?response_type=token'
    + '&client_id=diabetips-dashboard'
    + '&scope=profile:write connections:read connections:invite connections:write biometrics:read biometrics:write meals:read notes:read notes:write'
    + '&redirect_uri=' + window.location.href;
//window.location.href
  isLoading = true;

  constructor(
    @Inject(DOCUMENT) private document: Document, 
    private breakpointObserver: BreakpointObserver,
    private patientsService: PatientsService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) { }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(
    map(result => result.matches)
  );

  async ngOnInit() {
    await this.getToken(this.route)
    this.patientsService.getMe().subscribe(me => {
      this.me = me;
      this.patientsService.connectedId = me.uid
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
      this.router.navigate(['/accueil']);
    } else {
      this.document.location.href = encodeURI(this.signinUrl);
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
      this.patientsService.token = this.token
    });
  }

  pictureUrl?: SafeUrl

  getPictureForProfile(profile: Patient) {
    this.patientsService.getPatientPicture(profile.uid)
      .subscribe(picture => {
        profile.profile_picture = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(picture))
      });
  }

  signOut(): void {
    localStorage.removeItem('token');
    window.location.href = "https://account.diabetips.fr/logout"
  }

  invitePatient(): void {
    const dialogRef = this.dialog.open(InvitePatientComponent, {
      width: '25%',
      data: {email: ''}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patientsService.invitePatient(result, this.me.uid);
      }
    });
  }

  searchPatient() {
    if (this.searchText && this.searchText != "") {
      return this.patients.filter(patient => (patient.first_name + ' ' + patient.last_name).toLowerCase().includes(this.searchText))
    } else {
      return this.patients
    }
  }

  goToOptions() {
    window.location.href = "https://account.diabetips.fr/"
  }

}
