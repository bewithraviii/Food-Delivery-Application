import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { loginRequest, otpSendRequest, otpVerifyRequest } from 'src/app/models/api.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { NotificationService } from 'src/app/services/snack-notification/notification.service';
import { Clipboard } from '@angular/cdk/clipboard';



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
  userEmail: string = '';
  isOtpStage: boolean = false;
  otpVerified: boolean = false;

  resendDisabled: boolean = true;
  timer: number = 60;
  timerInterval: any;
  
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private clipboard: Clipboard,
    private apiService: ApiService,
    private authService: AuthService,
    private loadingController: LoadingController,
    private notification: NotificationService,
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      rememberMe: [false]
    })

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
  
  async onSubmit() {
    
    if (!this.loginForm.valid) {
      console.log('Form is invalid');
    }

    await this.presentLoader();

    const reqPayload: loginRequest = {
      email: this.loginForm.value.email,
      phoneNumber: this.loginForm.value.phoneNumber,
    }

    try {
      this.authService.processLogin(reqPayload).subscribe(
        () => {
          this.userEmail = reqPayload.email;
          this.sendOTPRequest();
          this.dismissLoader();
        }, error => {
          this.dismissLoader();
          this.notification.notifyUser("errorSnack", error.error.message);
          console.error('Login failed', error);
        }
      );
    } catch(err: any){
      this.dismissLoader();
      this.notification.notifyUser("errorSnack", err.message);
      console.log("LOGIN ERROR: ", err.message);
    }

  }

  async sendOTPRequest(){

    await this.presentLoader();

    const otpSendReq: otpSendRequest = {
      email: this.userEmail
    }

    try {
      this.apiService.sendOTP(otpSendReq).subscribe(
        (data: any) => {
          if(data.otp){
            this.isOtpStage = true;
            this.startOtpTimer();
            this.clipboard.copy(data.otpValue);
            this.dismissLoader();
            this.notification.notifyUser("successSnack", data.message);
          }
      }, error => {
        this.dismissLoader();
        this.notification.notifyUser("errorSnack", error.error.message);
        console.error('OTP send failed', error);
      });
    } catch(error: any){
      this.dismissLoader();
      this.notification.notifyUser("errorSnack", error.error.message);
      console.log("OTP ERROR: ", error.message);
    }

  }

  async pasteOtp() {
    try {
      
      const otp = await navigator.clipboard.readText();

      if (otp && otp.length === 6) {
        this.otpForm.patchValue({
          otp1: otp.charAt(0),
          otp2: otp.charAt(1),
          otp3: otp.charAt(2),
          otp4: otp.charAt(3),
          otp5: otp.charAt(4),
          otp6: otp.charAt(5)
        });
        this.notification.notifyUser("successSnack", "OTP pasted from clipboard!");
      } else {
        this.notification.notifyUser("errorSnack", "Invalid OTP format in clipboard.");
      }
    } catch (err) {
      console.error("Failed to read clipboard: ", err);
      this.notification.notifyUser("errorSnack", "Failed to read from clipboard.");
    }
  }

  async onSubmitOtp() {
    if (!this.otpForm.valid) {
      console.log('Invalid OTP');
      return;
    }

    await this.presentLoader('Logging in...');

    const otpPayload: otpVerifyRequest = {
      email: this.userEmail,
      otp: this.getOTPString()
    };

    console.log("otpPayload", otpPayload);

    this.apiService.verifyOTP(otpPayload).subscribe(
      (response) => {
        if(response && response.verified){
          this.dismissLoader();
          this.notification.notifyUser("successSnack", "OTP successfully verified");
          this.router.navigate(["/user-dashboard"]);
        }
        else {
          this.dismissLoader();
          this.notification.notifyUser("errorSnack", response.message);
          console.error('OTP verification failed', response.message);
        }
        clearInterval(this.timerInterval);
        this.isOtpStage = false;
        this.otpForm.reset();
      },
      (error) => {
        this.dismissLoader();
        this.notification.notifyUser("errorSnack", error.error.message);
        console.error('Something went wrong while verifying OTP', error);
      }
    );
  }

  goToVendorLogin() {
    this.router.navigate(["/public/vendor-login"]);
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

  resendOtp() {
    console.log('Resend OTP triggered for:', this.userEmail);
    this.otpForm.reset();
    this.startOtpTimer();

    this.sendOTPRequest();
  }

  startOtpTimer() {

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.resendDisabled = true;
    this.timer = 60;

    this.timerInterval = setInterval(() => {
        this.timer--;
        if (this.timer <= 0) {
          clearInterval(this.timerInterval);
          this.resendDisabled = false;
        }
    }, 1000);
  }

  async presentLoader(message?: string) {
    const loader = await this.loadingController.create({
      message: message,
      spinner: 'lines',
      backdropDismiss: false,
    });
    await loader.present();
  }
  
  async dismissLoader() {
    await this.loadingController.dismiss();
  }
    

}
