import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { loginRequest } from 'src/app/models/api.interface';
import { AuthService } from 'src/app/services/auth/auth.service';

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
    private router: Router,
    private authService: AuthService
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
      if (!this.loginForm.valid) {
        console.log('Form is invalid');
      }
      const reqPayload: loginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      }
      console.log('Form Submitted:', reqPayload);

      try {
        this.authService.processLogin(reqPayload);
        this.router.navigate(['/dashboard']);
      } catch(err: any){
        console.log("LOGIN ERROR: ", err.message);
      }

    }

    goToForgotPassword() {
      this.router.navigate(["/public/forgot-password"]);
    }

    goToSignUp() {
      this.router.navigate(["/public/sign-up"]);
    }

}
