import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent, AddMeasureComponent, ConfirmDeletionComponent } from './dashboard/dashboard.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCheckboxModule, MatInputModule, MatSelectModule, MatRadioModule, MatCardModule, MatToolbarModule, MatSidenavModule, MatIconModule, MatListModule, MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material';
import { MatDialogModule } from '@angular/material';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MainNavigationComponent, InvitePatientComponent, ChangePictureComponent } from './main-navigation/main-navigation.component';
import { LayoutModule } from '@angular/cdk/layout';

import { HttpClientModule } from '@angular/common/http';
import { HttpErrorHandler } from './http-error-handler.service';
import { MessageService } from './message.service';
import { MyProfileComponent } from './my-profile/my-profile.component';

import { ChartsModule } from 'ng2-charts';
import { PatientsService } from './patients-service/patients.service';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    MainNavigationComponent,
    InvitePatientComponent,
    ChangePictureComponent,
    AddMeasureComponent,
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
    ChartsModule
  ],
  providers: [
    HttpErrorHandler,
    MessageService,
    MatDatepickerModule,
    PatientsService,
    {provide: MAT_DATE_LOCALE, useValue: 'fr'}
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    InvitePatientComponent,
    ChangePictureComponent,
    ConfirmDeletionComponent,
    AddMeasureComponent
  ]
})
export class AppModule { }
