import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  logo: string = 'assets/svg/logo.svg';

  loginForm!: FormGroup;

  passwordVisible: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    })
  }

    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    }
  
    
    onSubmit() {
      if (this.loginForm.valid) {
        console.log('Form Submitted:', this.loginForm.value);
        // Perform additional actions, e.g., API call
      } else {
        console.log('Form is invalid');
      }
    }

    goToForgotPassword() {
      this.router.navigate(["/public/forgot-password"]);
    }

    goToSignUp() {
      this.router.navigate(["/public/sign-up"]);
    }

}
