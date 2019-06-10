import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    alert('Thanks!');
  }
}
