import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent, AddMeasureComponent, AddNoteComponent, ConfirmDeletionComponent } from './dashboard/dashboard.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MainNavigationComponent, InvitePatientComponent } from './main-navigation/main-navigation.component';
import { LayoutModule } from '@angular/cdk/layout';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorHandler } from './http-error-handler.service';
import { MessageService } from './message.service';
import { MyProfileComponent } from './my-profile/my-profile.component';

import { ChartsModule, ThemeService } from 'ng2-charts';
import { AuthInterceptor, PatientsService } from './patients-service/patients.service';

import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from '@angular/common';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { FlatpickrModule } from 'angularx-flatpickr';

import { NgChatModule } from 'ng-chat';
@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    MainNavigationComponent,
    InvitePatientComponent,
    AddMeasureComponent,
    AddNoteComponent,
    ConfirmDeletionComponent,
    MyProfileComponent,
  ],
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatTabsModule,
    MatMenuModule,
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCardModule,
    ReactiveFormsModule,
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    HttpClientModule,
    ChartsModule,
    CommonModule,
    FlatpickrModule.forRoot(),
    DragDropModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    NgChatModule
  ],
  providers: [
    HttpErrorHandler,
    MessageService,
    MatDatepickerModule,
    PatientsService,
    ThemeService,
    { provide: MAT_DATE_LOCALE, useValue: 'fr' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [
    AppComponent
  ],
  entryComponents: [
    InvitePatientComponent,
    ConfirmDeletionComponent,
    AddMeasureComponent,
    AddNoteComponent
  ]
})
export class AppModule { }
