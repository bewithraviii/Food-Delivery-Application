import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  logo: string = 'assets/svg/logo.svg';
  forgotPasswordForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      // Call the password reset service here
      console.log('Password reset request sent for email:', this.forgotPasswordForm.value.email);
      
      // Redirect user after form submission
      this.router.navigate(['/public/login']);
    }
  }

  backToLogin() {
    this.router.navigate(['/public/login']);
  }

}
