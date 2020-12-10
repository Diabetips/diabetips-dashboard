import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Patient } from './profile-classes';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';
import { Router } from '@angular/router';

import { ConvAdapter } from './conv-adapter'

import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/messaging';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable()
export class PatientsService {
  patientsUrl = 'https://api.diabetips.fr/v1/users';  // URL to web api
  authUrl = 'https://api.diabetips.fr/v1/auth';  // URL to web api
  convUrl = 'https://api.diabetips.fr/v1/chat'
  notifUrl = 'https://api.diabetips.fr/v1/notifications'
  private handleError: HandleError;

  token: string = undefined;
  connectedId: string = undefined;

  public messaging
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
    this.messaging = firebase.messaging();
    this.messaging.getToken({vapidKey: "BMg-O_t5azymJCJbJ91s404AF0lr8Nd0YsY9O_2tB2XSlniiGFCqFF1in52JsHMyleyZz8WtKbpZfAGBnDXxwDc"})
    .then(token => {
      if (token) {
        this.registerFcm(token);
      } else {
        Notification.requestPermission().then(() => {});
      }
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

  markNotifAsRead(notifId: string) {
    const url = `${this.notifUrl}/${notifId}`;
    return this.http.delete<any>(url)
  }

  //////// AI-related methods //////////

  getPredictionSettings(patientUid: string): Observable<any> {
    const url = `${this.patientsUrl}/${patientUid}/predictions/settings`;
    return this.http.get<any>(url)
     .pipe(
       catchError(this.handleError('getPredictionSettings', []))
     );
  }
  
  getPredictionComparison(patientUid: string): Observable<any> {
    const url = `${this.patientsUrl}/${patientUid}/predictions/comparison`;
    return this.http.get<any>(url)
     .pipe(
       catchError(this.handleError('getPredictionSettings', []))
     );
  }
  
  getPredictionComparisonLimit(patientUid: string, startDate: string, endDate: string): Observable<any> {
    const url = `${this.patientsUrl}/${patientUid}/predictions/comparison?start=${startDate}&end=${endDate}&size=100`;
    return this.http.get<any>(url)
     .pipe(
       catchError(this.handleError('getPredictionComparisonLimit', []))
     );
  }
  
  getPredictions(patientUid: string): Observable<any> {
    const url = `${this.patientsUrl}/${patientUid}/predictions`;
    return this.http.get<any>(url)
     .pipe(
       catchError(this.handleError('getPredictions', []))
     );
  }

  setPredictionSettings(patientUid: string, enabled: boolean) {
    console.log("setting prediction settings to " + enabled)
    const url = `${this.patientsUrl}/${patientUid}/predictions/settings`;
    this.http.put(url, { 'enabled': enabled })
      .subscribe(response => {
        console.log(response);
        location.reload()
      })
  }

  //////// Me-related methods //////////

  getMe(): Observable<any> {
    return this.http.get<any>(this.patientsUrl + '/me')
     .pipe(
       catchError(this.handleError('getMe', []))
     );
  }

  getAllPlanningEvents(): Observable<any> {
    return this.http.get<any>(this.patientsUrl + '/me/planning')
     .pipe(
       catchError(this.handleError('getMe', []))
     );
  }

  getPatientPlanningEvents(patientUid: string): Observable<any> {
    return this.http.get<any>(this.patientsUrl + '/' + patientUid +'/planning')
     .pipe(
       catchError(this.handleError('getMe', []))
     );
  }

  createPlanningEvent(title: string, description: string, dateStart: string, dateEnd: string, patientUid: string): Observable<any> {
    const url = `${this.patientsUrl}/me/planning`;
    return this.http.post(url, {
      title: title,
      description: description,
      start: dateStart,
      end: dateEnd,
      members: [
        patientUid,
      ]
    })
  }

  editPlanningEvent(eventId:string, title: string, description: string, dateStart: string, dateEnd: string, patientUid: string): Observable<any> {
    const url = `${this.patientsUrl}/me/planning/${eventId}`;
    return this.http.put(url, {
      title: title,
      description: description,
      start: dateStart,
      end: dateEnd
    })
  }

  deletePlanningEvent(eventId: string) {
    const url = `${this.patientsUrl}/me/planning/${eventId}`;
    return this.http.delete(url)
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

  addPatientNote(patientUid: string, note: any): Observable<any> {
    const url = `${this.patientsUrl}/me/sticky/${patientUid}`;
    return this.http.post(url, note)
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
    const url = `${this.patientsUrl}/${uid}/picture`;
    return this.http.get(url, { responseType: 'blob' })
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
    const url = `${this.patientsUrl}/${uid}/blood_sugar?page=1&size=100&start=` + startDate + '&end=' + endDate;
    return this.http.get(url)
  }

  getPatientBsLimitPage(uid: string, startDate: string, endDate: string, page: number): Observable<any> {
    const url = `${this.patientsUrl}/${uid}/blood_sugar?page=${page}&size=100&start=` + startDate + '&end=' + endDate;
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

  getPatientInsulinLimit(uid: string, startDate: string, endDate: string): Observable<any> {
    const url = `${this.patientsUrl}/${uid}/insulin?start=` + startDate + '&end=' + endDate;
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
