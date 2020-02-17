import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { OptionsComponent } from './options/options.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'mon-profil', component: MyProfileComponent },
  { path: 'options', component: OptionsComponent },
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
