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
  otpForm!: FormGroup;

  passwordVisible: boolean = false;
  isOtpStage: boolean = false;
  userEmail: string = '';
  
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

    // this.otpForm = this.fb.group({
    //   otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    // });
    this.otpForm = this.fb.group({
      otp1: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp2: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp3: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp4: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp5: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp6: ['', [Validators.required, Validators.pattern('^[0-9]$')]]
    });
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

      this.isOtpStage = true;
      this.userEmail = reqPayload.email;
      // try {
      //   this.authService.processLogin(reqPayload).subscribe(() => {
      //       // this.router.navigate(['/dashboard']);
      //     }, error => {
      //       console.error('Login failed', error);
      //     }
      //   );
      // } catch(err: any){
      //   console.log("LOGIN ERROR: ", err.message);
      // }

    }

    onSubmitOtp() {
      if (!this.otpForm.valid) {
        console.log('Invalid OTP');
        return;
      }
  
      const otpPayload = {
        email: this.userEmail,
        otp: this.getOTPString()
        // otp: this.otpForm.value.otp,
      };
  
      // this.authService.verifyOtp(otpPayload).subscribe(
      //   (response) => {
      //     // Handle successful OTP verification
      //     this.router.navigate(['/dashboard']);
      //   },
      //   (error) => {
      //     console.error('OTP verification failed', error);
      //   }
      // );
    }
  

    goToForgotPassword() {
      this.router.navigate(["/public/forgot-password"]);
    }

    goToSignUp() {
      this.router.navigate(["/public/sign-up"]);
    }

    moveFocus(event: any, nextInputName: string) {
      if (event.target.value.length === 1) {
        const nextInput = document.getElementsByName(nextInputName)[0] as HTMLInputElement;
        nextInput?.focus();
      }
    }
    
    getOTPString() {
      return [
        this.otpForm.value.otp1,
        this.otpForm.value.otp2,
        this.otpForm.value.otp3,
        this.otpForm.value.otp4,
        this.otpForm.value.otp5,
        this.otpForm.value.otp6
      ].join('');
    }

}
