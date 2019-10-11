import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sign-in-up',
  templateUrl: './sign-in-up.component.html',
  styleUrls: ['./sign-in-up.component.css']
})
export class SignInUpComponent {
  addressForm = this.fb.group({
    pseudonym: [null, Validators.required],
    password: [null, Validators.required],
    confirmation: [null, Validators.required]
  });

  hasUnitNumber = false;
  signinUrl = 'http://api.diabetips.fr/v1/auth/authorize?response_type=token&redirect_uri=http://localhost:4200/signinup';
  token = undefined;

  constructor(@Inject(DOCUMENT) private document: Document, private fb: FormBuilder, private router: Router, private route: ActivatedRoute) {
    this.getToken(route);
    if (this.token !== null && this.token !== undefined) {
      localStorage.setItem('token', this.token);
      this.router.navigate(['/informations']);
    } else {
      this.document.location.href = this.signinUrl;
    }
  }

  getToken(route: ActivatedRoute) {
    route.fragment.subscribe((fragment: string) => {
      if (!fragment) {
        return null;
      }

      // Init and fill parsed fragment
      let parsedFragment = new HttpParams();
      fragment.split('&').forEach((fragmentBit => {
        const fragmentBitArray = fragmentBit.split('=');
        parsedFragment = parsedFragment.set(fragmentBitArray[0], fragmentBitArray[1]);
      }));

      // Get token from parsed fragment
      this.token = parsedFragment.get('access_token');
    });
  }
}
