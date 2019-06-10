import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';

import { HeroesComponent } from './heroes/heroes.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeroDetailComponent } from './hero-detail/hero-detail.component';
import { SignInUpComponent } from './sign-in-up/sign-in-up.component';
import { MainNavigationComponent } from './main-navigation/main-navigation.component';

const routes: Routes = [
  { path: '', redirectTo: '/signinup', pathMatch: 'full' },
  { path: 'signinup', component: SignInUpComponent },
  { path: 'informations', component: MainNavigationComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'heroes', component: HeroesComponent },
  { path: 'detail/:id', component: HeroDetailComponent },
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
