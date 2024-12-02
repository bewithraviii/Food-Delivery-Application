import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
  logo: string = 'assets/svg/logo.svg';
  userType: string = 'user'; // Default value for toggle
  signupForm!: FormGroup;
  adminFormGroup1!: FormGroup;
  adminFormGroup2!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    // User Signup Form
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      address: ['', Validators.required],
    });

    // Admin Multi-Step Form Groups
    this.adminFormGroup1 = this.fb.group({
      restaurantName: ['', Validators.required],
      ownerName: ['', Validators.required],
    });

    this.adminFormGroup2 = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
    });
  }

  onUserTypeChange(value: string) {
    this.userType = value;
  }

  onSubmit() {
    if (this.userType === 'user' && this.signupForm.valid) {
      console.log('User Form Submitted:', this.signupForm.value);
    } else if (this.userType === 'admin') {
      if (this.adminFormGroup1.valid && this.adminFormGroup2.valid) {
        const adminData = {
          ...this.adminFormGroup1.value,
          ...this.adminFormGroup2.value,
        };
        console.log('Admin Form Submitted:', adminData);
      }
    } else {
      console.log('Form is invalid');
    }
  }

  goToSignIn() {
    this.router.navigate(['/public/login']);
  }
}
