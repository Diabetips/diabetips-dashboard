import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';


import { BehaviorSubject, Observable } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';

import { Patient } from './profile-classes';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';
import { ɵNoopAnimationStyleNormalizer } from '@angular/animations/browser';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};
                                                                                                                                                                             
@Injectable()
export class PatientsService {
  patientsUrl = 'https://api.dev.diabetips.fr/v1/users';  // URL to web api
  authUrl = 'https://api.dev.diabetips.fr/v1/auth';  // URL to web api
  private handleError: HandleError;

  token: string = undefined;
  connectedId: string = undefined;

  private pictureSub = new BehaviorSubject<Blob>(null);

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('PatientsService');
  }

  //////// Me-related methods //////////

  getMe(): Observable<any> {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.get<any>(this.patientsUrl + '/me', httpOptions)
     .pipe(
       catchError(this.handleError('getMe', []))
     );
  }

  //////// Connections-related methods //////////

  getConnections(uid: string): Observable<Patient[]> {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

    const url = `${this.patientsUrl}/${uid}/connections`;
    return this.http.get<Patient[]>(url, httpOptions)
     .pipe(
       catchError(this.handleError('getPatients', []))
     );
  }

  invitePatient(email: string, uid: string) {
    const url = `${this.patientsUrl}/${uid}/connections`;
    this.http.post(url, { 'email': email }, { observe: 'response'})
      .subscribe(response => {
        console.log(response.status);
        location.reload()
      })
  }

  deleteConnection(userUid, patientUid) {
    const url = `${this.patientsUrl}/${userUid}/connections/${patientUid}`;
    this.http.delete(url, { observe: 'response'})
      .subscribe(response => {
        console.log(response.status);
        location.reload()
      })
  }

  //////// Notes-related methods //////////

  getPatientNotes(myUid: string, patientUid: string): Observable<any> {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

    const url = `${this.patientsUrl}/${myUid}/sticky/${patientUid}`;
    return this.http.get(url, httpOptions)
  }

  addPatientNote(myUid: string, patientUid: string, note: any) {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

    const url = `${this.patientsUrl}/${myUid}/sticky/${patientUid}`;
    this.http.post(url, note, httpOptions)
    .subscribe(response => {
      console.log(response);
    })
  }

  deletePatientNote(myUid: string, patientUid: string, id: string) {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

    const url = `${this.patientsUrl}/${myUid}/sticky/${patientUid}/${id}`;
    this.http.delete(url, httpOptions)
  }

  //////// Patient-related methods //////////

  getPatient(uid: string): Observable<Patient> {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

    const url = `${this.patientsUrl}/${uid}`;
    return this.http.get<Patient>(url, httpOptions);
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
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

    const url = `${this.patientsUrl}/${uid}/hba1c`;
    return this.http.get(url, httpOptions)
  }

  getPatientBs(uid: string): Observable<any> {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

    const url = `${this.patientsUrl}/${uid}/blood_sugar`;
    return this.http.get(url, httpOptions)
  }

  getPatientInsulin(uid: string): Observable<any> {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

    const url = `${this.patientsUrl}/${uid}/insulin`;
    return this.http.get(url, httpOptions)
  }

  getPatientMeals(uid: string): Observable<any> {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

    const url = `${this.patientsUrl}/${uid}/meals`;
    return this.http.get(url, httpOptions)
  }

  getPatientBiometrics(uid: string): Observable<any> {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

    const url = `${this.patientsUrl}/${uid}/biometrics`;
    return this.http.get(url, httpOptions)
  }

  //////// Direct patient profile modification //////////

  /** PUT: update the patient on the server. Returns the updated patient upon success. */
  updatePatient(patient: any, uid: string): Observable<any> {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
    
    const url = `${this.patientsUrl}/${uid}`;
    return this.http.put<any>(url, patient, httpOptions)
      .pipe(
        catchError(this.handleError('updatePatient', patient))
      );
  }

  updateGeneralBiometrics(uid: string, height: number, mass: number) {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
    
    const url = `${this.patientsUrl}/${uid}/biometrics`;
    return this.http.put<any>(url, {"mass": mass, "height": height}, httpOptions)
      .subscribe(response => {
        console.log(response)
      })
  }

  addHbMeasure(measure: string, timestamp: number, patientId: string) {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
    
    const url = `${this.patientsUrl}/${patientId}/hba1c`;
    // dividing by 1000 because we need to remove
    this.http.post(url, { 'value': parseFloat(measure), 'timestamp': timestamp/1000}, { observe: 'response'})
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
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
    
    const url = `${this.patientsUrl}/${uid}`;
    return this.http.delete<any>(url, httpOptions)
      .pipe(
        catchError(this.handleError('deactivateAccount'))
      );
  }
}

