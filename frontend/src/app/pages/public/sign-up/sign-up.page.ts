import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
  logo: string = 'assets/svg/logo.svg';
  selectedTab: number = 0; // Default tab
  isMobileView: boolean = false; // To track screen size
  signupForm!: FormGroup;
  adminFormGroup1!: FormGroup;
  adminFormGroup2!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).subscribe(result => {
      this.isMobileView = result.matches;
    });

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

  onTabChange(index: number) {
    this.selectedTab = index;
  }

  onSubmit() {
    if (this.selectedTab === 0 && this.signupForm.valid) {
      console.log('User Form Submitted:', this.signupForm.value);
    } else if (this.selectedTab === 1) {
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
