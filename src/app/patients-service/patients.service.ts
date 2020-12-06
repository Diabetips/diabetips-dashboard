import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';

import { Patient } from './profile-classes';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';
import { ɵNoopAnimationStyleNormalizer } from '@angular/animations/browser';
import { Router } from '@angular/router';

import { ConvAdapter } from './conv-adapter'

import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/messaging';
import { ChatParticipantStatus, ChatParticipantType, ParticipantResponse } from 'ng-chat';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable()
export class PatientsService {
  patientsUrl = 'https://api.dev.diabetips.fr/v1/users';  // URL to web api
  authUrl = 'https://api.dev.diabetips.fr/v1/auth';  // URL to web api
  convUrl = 'https://api.dev.diabetips.fr/v1/chat'
  notifUrl = 'https://api.dev.diabetips.fr/v1/notifications'
  private handleError: HandleError;

  token: string = undefined;
  connectedId: string = undefined;

  public convAdapter: ConvAdapter

  private pictureSub = new BehaviorSubject<Blob>(null);

  constructor(private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('PatientsService');

    //////// Firebase Setup //////////
    
    var firebaseConfig = {
      apiKey: "AIzaSyBBlVe4BM_u8BIFWBMbMdPGQMHEjTweUzo",
      authDomain: "diabetips-42069.firebaseapp.com",
      databaseURL: "https://diabetips-42069.firebaseio.com",
      projectId: "diabetips-42069",
      storageBucket: "diabetips-42069.appspot.com",
      messagingSenderId: "662514934162",
      appId: "1:662514934162:web:536585977496be771fa14b",
      measurementId: "G-X6DVX49JTZ"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Retrieve an instance of Firebase Messaging so that it can handle background messages.
    const messaging = firebase.messaging();
    messaging.getToken({vapidKey: "BMg-O_t5azymJCJbJ91s404AF0lr8Nd0YsY9O_2tB2XSlniiGFCqFF1in52JsHMyleyZz8WtKbpZfAGBnDXxwDc"})
    .then((token) => {
      if (token) {
        this.registerFcm(token);
      } else {
        Notification.requestPermission().then(() => {});
      }
    });

    // Handle incoming messages. Called when:
    // - a message is received while the app has focus
    // - the user clicks on an app notification created by a service worker
    //   `messaging.setBackgroundMessageHandler` handler.
    messaging.onMessage((payload) => {
      console.log('Message received. ', payload);
      //this.convAdapter = new ConvAdapter(me.uid, this.patientsService)

      // Pass the new message to the conversation adapter for things
      this.convAdapter.onMessageReceived({
        participantType: ChatParticipantType.User,
        id: "000",
        status: ChatParticipantStatus.Online,
        avatar: '',
        displayName: "Baguettson"
      }, {
        fromId: "000",
        toId: "000",
        message: "Hello World !"
      })
    });
  }

  //////// Chat-related methods //////////

  getConversation(patientUid: string) {
    const url = `${this.convUrl}/${patientUid}`;
    return this.http.get<any>(url)
      .pipe(
        catchError(this.handleError('getConversation', []))
      );
  }

  sendMessage(patientUid: string, message: string) {
    const url = `${this.convUrl}/${patientUid}`;
    this.http.post(url, { content: message })
      .subscribe(response => { })
  }

  //////// Notifications-related methods //////////

  registerFcm(token: string) {
    const url = `${this.notifUrl}/fcm_token`;
    this.http.post(url, { 'token': token })
      .subscribe(response => { })
  }

  getAllNotifications() {
    const url = `${this.notifUrl}`;
    return this.http.get<any>(url)
      .pipe(
        catchError(this.handleError('getPatients', []))
      );
  }

  sendTestNotif() {
    const url = `${this.notifUrl}/test`;
    return this.http.get<any>(url)
      .pipe(
        catchError(this.handleError('sendTestNotif', []))
      );
  }

  //////// Me-related methods //////////

  getMe(): Observable<any> {
    return this.http.get<any>(this.patientsUrl + '/me')
     .pipe(
       catchError(this.handleError('getMe', []))
     );
  }

  //////// Connections-related methods //////////

  getConnections(): Observable<Patient[]> {
    const url = `${this.patientsUrl}/me/connections`;
    return this.http.get<Patient[]>(url)
     .pipe(
       catchError(this.handleError('getPatients', []))
     );
  }

  invitePatient(email: string, uid: string) {
    const url = `${this.patientsUrl}/${uid}/connections`;
    this.http.post(url, { 'email': email })
      .subscribe(response => {
        console.log(response);
        location.reload()
      })
  }

  deleteConnection(userUid, patientUid) {
    const url = `${this.patientsUrl}/${userUid}/connections/${patientUid}`;
    this.http.delete(url)
      .subscribe(response => {
        console.log(response);
        location.reload()
      })
  }

  //////// Notes-related methods //////////

  getPatientNotes(patientUid: string): Observable<any> {
    const url = `${this.patientsUrl}/me/sticky/${patientUid}`;
    return this.http.get(url)
  }

  addPatientNote(patientUid: string, note: any) {
    const url = `${this.patientsUrl}/me/sticky/${patientUid}`;
    this.http.post(url, note)
    .subscribe(response => {
      console.log(response);
    })
  }

  moveNote(patientUid: string, note: any, newIndex: number) {
    note.index = newIndex + 1

    const url = `${this.patientsUrl}/me/sticky/${patientUid}/${note.id}`;
    this.http.put(url, note)
    .subscribe(response => {
      //console.log(response);
    })
  }

  deletePatientNote(patientUid: string, id: string) {
    const url = `${this.patientsUrl}/me/sticky/${patientUid}/${id}`;
    this.http.delete(url)
    .subscribe(response => {
      //console.log(response);
    })
  }

  //////// Patient-related methods //////////

  getPatient(uid: string): Observable<Patient> {
    const url = `${this.patientsUrl}/${uid}`;
    return this.http.get<Patient>(url);
  }

  getPatientPicture(uid: string): Observable<Blob> {
    const httpOptionsImage = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }),
      responseType: 'blob'
    };

    const url = `${this.patientsUrl}/${uid}/picture`;
    return this.http.get(url, { responseType: 'blob' })
      .pipe(
        mergeMap((picture) => {
          this.pictureSub.next(picture);
          return this.pictureSub.asObservable();
        })
      );
  }

  getPatientHb(uid: string): Observable<any> {
    const url = `${this.patientsUrl}/${uid}/hba1c`;
    return this.http.get(url)
  }

  getPatientHbLimit(uid: string, startDate: string, endDate: string): Observable<any> {
    const url = `${this.patientsUrl}/${uid}/hba1c?start=` + startDate + '&end=' + endDate;
    return this.http.get(url)
  }

  getPatientBs(uid: string): Observable<any> {
    const url = `${this.patientsUrl}/${uid}/blood_sugar`;
    return this.http.get(url)
  }

  getPatientBsLimit(uid: string, startDate: string, endDate: string): Observable<any> {
    const url = `${this.patientsUrl}/${uid}/blood_sugar?start=` + startDate + '&end=' + endDate;
    return this.http.get(url)
  }

  getPatientBsTarget(uid: string, startDate: string, endDate: string): Observable<any> {
    const url = `${this.patientsUrl}/${uid}/blood_sugar/target?start=` + startDate + '&end=' + endDate;
    return this.http.get(url)
  }

  insulinTypes = ["slow", "fast", "very_fast"];

  getPatientInsulin(uid: string, type: number): Observable<any> {
    const url = `${this.patientsUrl}/${uid}/insulin?type=${this.insulinTypes[type]}`;
    return this.http.get(url)
  }

  getPatientInsulinLimit(uid: string, startDate: string, endDate: string, type: number): Observable<any> {
    const url = `${this.patientsUrl}/${uid}/insulin?type=${this.insulinTypes[type]}&start=` + startDate + '&end=' + endDate;
    return this.http.get(url)
  }

  getPatientMeals(uid: string): Observable<any> {
    const url = `${this.patientsUrl}/${uid}/meals`;
    return this.http.get(url)
  }

  getPatientBiometrics(uid: string): Observable<any> {
    const url = `${this.patientsUrl}/${uid}/biometrics`;
    return this.http.get(url)
  }

  //////// Direct patient profile modification //////////

  /** PUT: update the patient on the server. Returns the updated patient upon success. */
  updatePatient(patient: any, uid: string): Observable<any> {
    const url = `${this.patientsUrl}/${uid}`;
    return this.http.put<any>(url, patient)
      .pipe(
        catchError(this.handleError('updatePatient', patient))
      );
  }

  updateGeneralBiometrics(uid: string, height: number, mass: number) {
    const url = `${this.patientsUrl}/${uid}/biometrics`;
    return this.http.put<any>(url, {"mass": mass, "height": height})
      .subscribe(response => {
        console.log(response)
      })
  }

  addHbMeasure(measure: string, time: string, patientId: string) {
    const url = `${this.patientsUrl}/${patientId}/hba1c`;
    this.http.post(url, { 'value': parseFloat(measure), 'time': time}, { observe: 'response'})
      .subscribe(response => {
        console.log(response.status);
      })
  }

  reinitialisePassword(email: string) {
    const url = `${this.authUrl}/reset-password`;
    this.http.post(url, { 'email': email }, { observe: 'response'})
      .subscribe(response => {
        console.log(response.status);
      })
  }

  deactivateAccount(uid: string) {
    const url = `${this.patientsUrl}/${uid}`;
    return this.http.delete<any>(url)
      .pipe(
        catchError(this.handleError('deactivateAccount'))
      );
  }
}
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private patientsService: PatientsService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.patientsService.token;
    const isApiReq = req.url.startsWith('');

    if (token && isApiReq) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        }
      });
      return next.handle(req)
    }
  }
}
