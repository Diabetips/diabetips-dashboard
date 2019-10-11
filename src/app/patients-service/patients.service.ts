import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';


import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Patient } from './patient';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    Authorization: 'my-auth-token'
  })
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

  /** GET patients from the server */
  getPatients(): Observable<Patient[]> {
     return this.http.get<Patient[]>(this.patientsUrl)
      .pipe(
        catchError(this.handleError('getPatients', []))
      );
  }

  getPatient(uid): Observable<Patient> {
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
    console.log('Deleting patient uid ' + id);
    return this.http.delete(url, httpOptions)
      .pipe(
        catchError(this.handleError('deletePatient'))
      );
  }

  /** PUT: update the patient on the server. Returns the updated patient upon success. */
  updatePatient(patient: Patient): Observable<Patient> {
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'my-new-auth-token');

    return this.http.put<Patient>(this.patientsUrl, patient, httpOptions)
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
