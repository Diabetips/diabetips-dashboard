import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCheckboxModule, MatInputModule, MatSelectModule, MatRadioModule, MatCardModule, MatToolbarModule, MatSidenavModule, MatIconModule, MatListModule } from '@angular/material';
import { MatDialogModule } from '@angular/material';
import { SignInUpComponent } from './sign-in-up/sign-in-up.component';
import { MainNavigationComponent, InvitePatientComponent } from './main-navigation/main-navigation.component';
import { LayoutModule } from '@angular/cdk/layout';

import { HttpClientModule } from '@angular/common/http';
import { HttpErrorHandler } from './http-error-handler.service';
import { MessageService } from './message.service';

@NgModule({
  declarations: [
    AppComponent,
    PatientDetailComponent,
    DashboardComponent,
    SignInUpComponent,
    MainNavigationComponent,
    InvitePatientComponent
  ],
  imports: [
    MatDialogModule,
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
    HttpClientModule
  ],
  providers: [
    HttpErrorHandler,
    MessageService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    InvitePatientComponent
  ]
})
export class AppModule { }
