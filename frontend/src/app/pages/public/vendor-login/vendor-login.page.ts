import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { otpSendRequest, otpVerifyRequest, vendorLoginRequest } from 'src/app/models/api.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './vendor-login.page.html',
  styleUrls: ['./vendor-login.page.scss'],
})
export class VendorLoginPage implements OnInit {
  logo: string = 'assets/svg/logo.svg';
  vendorLoginForm!: FormGroup;
  otpForm!: FormGroup;
  showVerificationOptions = false;
  otpVisible: Boolean = false;
  selectedMethod: 'OTP' | 'QR' = 'OTP'; 
  selectedMethodIndex = 0;
  qrVisible = false;
  resendDisabled: boolean = true;
  timer: number = 60;
  timerInterval: any;
  email: string = '';
  qrCodeImage: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.vendorLoginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    });

    this.otpForm = this.formBuilder.group({
      otp1: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp2: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp3: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp4: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp5: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      otp6: ['', [Validators.required, Validators.pattern('^[0-9]$')]]
    });
  }

  async onSubmit() {
    if (!this.vendorLoginForm.valid) {
      console.log('Vendor Login Form is invalid');
    }

    await this.presentLoader()

    const vendorLoginForm: vendorLoginRequest = {
      email: this.vendorLoginForm.value.email,
      phoneNumber: this.vendorLoginForm.value.phoneNumber,
    }
    this.email = this.vendorLoginForm.value.email;
    console.log('Vendor-Login', vendorLoginForm);
    this.authService.processVendorLogin(vendorLoginForm).subscribe(
      () => { 
        this.dismissLoader();
        this.showVerificationOptions = true;
      },
      (error: any) => {
        this.dismissLoader();
        console.error('Login failed', error);
      }
    );
  }
  
  onClickSendOTP(){
    this.otpVisible = true;
    this.sendOTPRequest();
  }

  async sendOTPRequest(){

    await this.presentLoader();

    const otpSendReq: otpSendRequest = {
      email: this.email
    }

    try {
      this.apiService.sendOTP(otpSendReq).subscribe(() => {
        this.startOtpTimer();
        this.dismissLoader();
      }, error => {
        this.dismissLoader();
        console.error('OTP send failed', error);
      });
    } catch(error: any){
      this.dismissLoader();
      console.log("OTP ERROR: ", error.message);
    }

  }

  async onSubmitOTP() {
    if (!this.otpForm.valid) {
      console.log('OTP Form is invalid');
      return;
    }

    await this.presentLoader('Logging in...');

    const otpPayload: otpVerifyRequest = {
      otp: this.getOTPString(),
      email: this.email
    };

    console.log('Verifying OTP:', otpPayload);
    
    this.apiService.verifyOTP(otpPayload).subscribe(
      (response) => {
        if(response && response.verified){
          this.dismissLoader();
          this.router.navigate(["/vendor-dashboard"]);
        }
        else {
          this.dismissLoader();
          console.error('OTP verification failed', response.message);
        }
      },
      (error) => {
        this.dismissLoader();
        console.error('Something went wrong while verifying OTP', error);
      }
    );
  }

  onSubmitQR() {
    this.presentLoader('Generating QR...');

    
    const vendorLoginForm: vendorLoginRequest = {
      email: this.vendorLoginForm.value.email,
      phoneNumber: this.vendorLoginForm.value.phoneNumber,
    }
    
    
    this.apiService.generateQRCode(vendorLoginForm).subscribe(
      (response) => {
        this.qrVisible = true;
        this.dismissLoader();
        this.qrCodeImage = response.qrCode;
      },
      (error: any) => {
        this.dismissLoader();
        console.error('QR Code generation failed:', error);
      }
    );
  }


  onTabChange(event: any) {
    this.selectedMethodIndex = event.index;
    this.selectedMethod = this.selectedMethodIndex === 0 ? 'OTP' : 'QR';
  }

  backToLogin() {
    this.router.navigate(['/public/login']);
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
    console.log('Resend OTP triggered for:', this.email);
    this.otpForm.reset();
    this.startOtpTimer();

    this.sendOTPRequest();
  }

  onScanSuccess(qrData: string) {
    const userData = JSON.parse(qrData); // Decode QR data
  
    // Display credentials for confirmation
    const confirm = window.confirm(`Confirm Your Credentials:\nEmail: ${userData.email}\nPhoneNo: ${userData.phoneNumber}`);
  
    if (confirm) {
      // On Yes, navigate to Dashboard
      this.router.navigate(['/dashboard']);
    } else {
      // On No, navigate back to Login Page
      this.router.navigate(['/login']);
    }
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
