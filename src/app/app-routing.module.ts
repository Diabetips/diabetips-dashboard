import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { PatientDetailComponent } from './patient-detail/patient-detail.component';
import { SignInUpComponent } from './sign-in-up/sign-in-up.component';
import { MainNavigationComponent } from './main-navigation/main-navigation.component';

const routes: Routes = [
  { path: '', redirectTo: '/signinup', pathMatch: 'full' },
  { path: 'signinup', component: SignInUpComponent },
  { path: 'informations', component: MainNavigationComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'detail/:id', component: PatientDetailComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
