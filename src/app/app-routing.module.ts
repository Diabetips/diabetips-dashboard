import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { MyProfileComponent } from './my-profile/my-profile.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'accueil', component: MyProfileComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
