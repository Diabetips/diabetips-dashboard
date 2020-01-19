import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';


import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Patient } from './patient';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  }),
};

@Injectable()
export class PatientsService {
  patientsUrl = 'https://api.diabetips.fr/v1/users';  // URL to web api
  private handleError: HandleError;

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('PatientsService');
  }

  getMe(): Observable<any> {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.get<any>(this.patientsUrl + '/me', httpOptions)
     .pipe(
       catchError(this.handleError('getMe', []))
     );
  }

  /** GET patients from the server */
  getPatients(): Observable<Patient[]> {
     return this.http.get<Patient[]>(this.patientsUrl)
      .pipe(
        catchError(this.handleError('getPatients', []))
      );
  }

  getPatient(uid: string): Observable<Patient> {
    return this.http.get<Patient>(this.patientsUrl + '/' + uid);
  }

  /* GET patients whose name contains search term */
  searchPatient(term: string): Observable<Patient[]> {
    term = term.trim();

    // Add safe, URL encoded search parameter if there is a search term
    const options = term ?
     { params: new HttpParams().set('name', term) } : {};

    return this.http.get<Patient[]>(this.patientsUrl, options)
      .pipe(
        catchError(this.handleError<Patient[]>('searchPatient', []))
      );
  }

  //////// Connections related methods //////////

  /** GET connections to the user from the server */
  getConnections(uid: string): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.patientsUrl + '/' + uid + '/connections')
     .pipe(
       catchError(this.handleError('getPatients', []))
     );
 }

  invitePatient(email: string, uid: string) {
    this.http.post(this.patientsUrl + '/' + uid + '/connections', { 'email': email }, { observe: 'response'})
      .subscribe(response => {
        console.log(response.status);
      })
  }

  deleteConnection(userUid, patientUid) {
    this.http.delete(this.patientsUrl + userUid + '/connections/' + patientUid, { observe: 'response'})
      .subscribe(response => {
        console.log(response.status);
      })
  }

  //////// Save methods //////////

  /** POST: add a new patient to the database */
  addPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(this.patientsUrl, patient, httpOptions)
      .pipe(
        catchError(this.handleError('addPatient', patient))
      );
  }

  /** DELETE: delete the patient from the server */
  deletePatient(id: number): Observable<{}> {
    const url = `${this.patientsUrl}/${id}`;
    return this.http.delete(url, httpOptions)
      .pipe(
        catchError(this.handleError('deletePatient'))
      );
  }

  /** PUT: update the patient on the server. Returns the updated patient upon success. */
  updatePatient(patient: any, uid: number): Observable<any> {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

    return this.http.put<any>(this.patientsUrl + '/' + uid, patient, httpOptions)
      .pipe(
        catchError(this.handleError('updatePatient', patient))
      );
  }
}

/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
