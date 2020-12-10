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

import { ConvAdapter } from '../patients-service/conv-adapter';
import { ChatParticipantStatus, ChatParticipantType, ParticipantResponse } from 'ng-chat';

import * as moment from 'moment';
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
    + '&scope=profile:write connections:read connections:invite connections:write biometrics:read biometrics:write meals:read notes:read notes:write notifications chat predictions:new predictions:settings';

  isLoading = true;

  notificationsList = [];
  
  public adapter: ConvAdapter;

  public readyToChat = false;

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
      this.adapter = new ConvAdapter(me.uid, this.patientsService)
      this.readyToChat = true
      this.patientsService.connectedId = me.uid
      // this.getPictureForProfile(this.me)
      this.getConnections();
      this.getNotifications();

      this.patientsService.messaging.onMessage(payload => {
        console.log('Message received. ', payload);
        
        if (payload.data.type == "chat_message") {
          // Pass the new message to the conversation adapter for things
          this.adapter.onMessageReceived({
            participantType: ChatParticipantType.User,
            id: payload.data.from_uid,
            status: ChatParticipantStatus.Online,
            avatar: null,
            displayName: payload.notification.title
          }, {
            fromId: payload.data.from_uid,
            toId: me.uid,
            message: payload.notification.body
          })
        } else if (payload.data.type == "user_invite_accepted") {
          payload.data.time = moment(payload.data.time).utc().format('DD/MM/YYYY HH:mm')
          payload.data.description = "Invitation acceptée"
          this.notificationsList.push(payload.data)
        }
      });

      // this.patientsService.messaging.onBackgroundMessage(payload => {
      //   console.log('BACKGROUND Message received. ', payload);
        
      //   if (payload.data.type == "chat_message") {
      //     // Pass the new message to the conversation adapter for things
      //     this.adapter.onMessageReceived({
      //       participantType: ChatParticipantType.User,
      //       id: payload.data.from_uid,
      //       status: ChatParticipantStatus.Online,
      //       avatar: null,
      //       displayName: payload.notification.title
      //     }, {
      //       fromId: payload.data.from_uid,
      //       toId: me.uid,
      //       message: payload.notification.body
      //     })
      //   } else if (payload.data.type == "user_invite_accepted") {
      //     payload.data.time = moment(payload.data.time).utc().format('DD/MM/YYYY HH:mm')
      //     payload.data.description = "Invitation acceptée"
      //     this.notificationsList.push(payload.data)
      //   }

      //   const notificationTitle = payload.data.description;
      //   const notificationOptions = {
      //     body: payload.data.notification,
      //     icon: '/firebase-logo.png'
      //   };

      //   return this.patientsService.messaging.registration.showNotification(notificationTitle, notificationOptions);
      // })
    });
  }

  getConnections(): void {
    this.patientsService.getConnections()
      .subscribe(patients => {
        this.patients = patients;
        this.patients.forEach(patient => {
          this.getPictureForProfile(patient)
        });
      });
  }

  getNotifications(): void {
    this.patientsService.getAllNotifications()
      .subscribe(notificationsList => {
        notificationsList = notificationsList.filter(notification => !notification.read)

        notificationsList.forEach(notification => {
          notification.time = moment(notification.time).utc().format('DD/MM/YYYY HH:mm')

          if (notification.type == "chat_message") {
            notification.description = "Nouveau message"
          } else if (notification.type == "user_invite_accepted") {
            notification.description = "Invitation acceptée"
          } else {
            notification.description = "Inconnu"
          }
        });
        this.notificationsList = notificationsList
      })
  }

  async getToken(route) {
    this.token = await localStorage.getItem('token');
    if (!this.token) {
      await this.getTokenFromUrl(route)
    }

    if (this.token !== null && this.token !== undefined) {
      localStorage.setItem('token', this.token);
      this.patientsService.token = this.token
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

  sendTestNotif() {
    this.patientsService.sendTestNotif()
    .subscribe(response => { })
  }

  markNotifAsRead(notification, index) {
    console.log(notification.id)
    
    this.patientsService.markNotifAsRead(notification.id)
    .subscribe(response => {
      console.log(response)
    })

    return false
  }

}
