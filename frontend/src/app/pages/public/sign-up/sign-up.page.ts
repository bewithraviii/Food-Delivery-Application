import { ChangeDetectorRef, Component, inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import { MatStepper, StepperOrientation } from '@angular/material/stepper';
import { map, Observable } from 'rxjs';
import { vendorSignUpReqForm, userSignUpReqForm, otpVerifyRequest, otpSendRequest } from 'src/app/models/api.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { NotificationService } from 'src/app/services/snack-notification/notification.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
 
  otpForm!: FormGroup;
  signupForm!: FormGroup;
  adminFormGroup1!: FormGroup;
  adminFormGroup2!: FormGroup;
  adminFormGroup3!: FormGroup;
  adminFormGroup4!: FormGroup;
  stepperOrientation!: Observable<StepperOrientation>;
  logo: string = 'assets/svg/logo.svg';
  selectedTab: number = 0;
  isOtpStage: boolean = false;
  userEmail: string = '';
  vendorEmail: string = '';
  resendDisabled: boolean = true;
  timer: number = 60;
  timerInterval: any;

  @ViewChild('adminStepper', { static: false }) adminStepper!: MatStepper;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authApiService: AuthService,
    private apiService: ApiService,
    private notification: NotificationService,
    breakpointObserver: BreakpointObserver,
  ) {
    this.stepperOrientation = breakpointObserver
      // .observe('(min-width: 800px)')
      // .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));

      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(map(({ matches }) => (matches ? 'vertical' : 'horizontal')));
  }

  ngOnInit(): void {

    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      address: ['', Validators.required],
    });

    this.adminFormGroup1 = this.fb.group({
      restaurantName: ['', Validators.required],
      restaurantAddress: ['', Validators.required],
      restaurantEmail: ['', Validators.required],
      restaurantWebsite: ['', Validators.required],
    });

    this.adminFormGroup2 = this.fb.group({
      ownerName: ['', Validators.required],
      ownerEmail: ['', [Validators.required, Validators.email]],
      ownerPhone: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      ownerAddress: ['', Validators.required],
    });

    this.adminFormGroup3 = this.fb.group({
      ownerAadharCardNumber: ['', Validators.required],
      ownerPanCardNumber: ['', Validators.required],
      ownerBankDetails: ['', Validators.required],
    })

    this.adminFormGroup4 = this.fb.group({
      cuisineType: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue]
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

  onTabChange(index: number): void {
    this.selectedTab = index;
    if (this.selectedTab === 1) {
      this.resetAdminStepper();
    }
    this.resetUserForm();
    this.resetAdminForm();
  }

  resetAdminStepper(): void {
    if (this.selectedTab === 1 && this.adminStepper) {
      this.adminStepper.reset();
    }
  }

  onSubmit() {
    if (this.selectedTab === 0 && this.signupForm.valid) {
      console.log('User Form Submitted:', this.signupForm.value);
      try{
        this.userEmail = this.signupForm.value.email;
        this.sendOTPRequest();
      } catch(err: any) {
        console.log("USER SIGN-UP ERROR: ", err.message);
      }
    } else if (this.selectedTab === 1) {
      if (this.adminFormGroup1.valid && this.adminFormGroup2.valid && this.adminFormGroup3.valid) {
        try{
          this.vendorEmail = this.adminFormGroup2.value.ownerEmail;
          this.sendOTPRequest();
        } catch(err: any){
          console.log("VENDOR SIGN-UP ERROR: ", err.message);
        }
      }
    } else {
      this.notification.notifyUser("errorSnack", "Form is invalid, Please fill details correctly.");
    }
  }

  
  sendOTPRequest(){
    const otpSendReq: otpSendRequest = {
      email: this.selectedTab === 0 ? this.userEmail : this.vendorEmail,
    }
    try {
      if(!otpSendReq.email){
        console.log("Email not found");
        return;
      }
      this.apiService.sendOTP(otpSendReq).subscribe(() => {
        this.isOtpStage = true;
        this.startOtpTimer();
      }, error => {
        console.error('OTP send failed', error);
      });
    } catch(error: any){
      console.log("OTP ERROR: ", error.message);
    }

  }

  onSubmitOtp() {
    if (!this.otpForm.valid) {
      console.log('Invalid OTP');
      return;
    }

    const otpPayload: otpVerifyRequest = {
      email: this.selectedTab === 0 ? this.userEmail : this.vendorEmail,
      otp: this.getOTPString()
    };

    console.log("otpPayload", otpPayload);

    this.apiService.verifyOTP(otpPayload).subscribe(
      (response) => {
        if(response && response.verified){
          if (this.selectedTab === 0) {
            const userData = this.signupForm.value;
            const userForm: userSignUpReqForm = {
              name: userData.name,
              email: userData.email,
              phoneNumber: userData.phoneNumber,
              address: userData.address
            }
            this.authApiService.processUserRegistration(userForm).subscribe(
              (Response) => {
                if(!Response){
                  console.log("User not registered, Please try again.");
                  this.notification.notifyUser("errorSnack", 'User not registered, Please try again.');
                }
                else {
                  this.notification.notifyUser("successSnack", 'User successfully added.');
                  this.router.navigate(['/dashboard']);
                }
              },
              (error) => {
                console.log("Something went wrong while registering user.")
                this.notification.notifyUser("errorSnack", error.message);
              }
            );
            this.otpForm.reset();
            clearInterval(this.timerInterval);
            this.isOtpStage = false;
          } else if (this.selectedTab === 1) {
            const adminData = {
              ...this.adminFormGroup1.value,
              ...this.adminFormGroup2.value,
              ...this.adminFormGroup3.value,
              ...this.adminFormGroup4.value,
            };
            const vendorForm: vendorSignUpReqForm = {
              name: adminData.restaurantName,
              address: adminData.restaurantAddress,
              email: adminData.restaurantEmail,
              cuisineType: adminData.cuisineType,
              website: adminData.restaurantWebsite,
              owner: {
                name: adminData.ownerName,
                email: adminData.ownerEmail,
                phoneNo: adminData.ownerPhone,
                address: adminData.ownerAddress,
                bankDetails: adminData.ownerBankDetails,
                panCardNo: adminData.ownerPanCardNumber,
                aadharCardNo: adminData.ownerAadharCardNumber
              },
              acceptTermsAndRegulations: adminData.agreeTerms,
            }
            console.log('Vendor Form Submitted:', vendorForm);
            this.authApiService.processVendorRegistration(vendorForm).subscribe(
              (Response) => {
                if(!Response){
                  console.log("Vendor not registered, Please try again.");
                  this.notification.notifyUser("errorSnack", 'Vendor not registered, Please try again.');
                }
                else {
                  this.notification.notifyUser("successSnack", 'Vendor successfully added.');
                  this.router.navigate(['/dashboard']);
                }
              },
              (error) => {
                console.log("Something went wrong while registering vendor.")
                this.notification.notifyUser("errorSnack", error.message);
              }
            );
            this.otpForm.reset();
            clearInterval(this.timerInterval);
            this.isOtpStage = false;
          }
        }
        else {
          console.error('OTP verification failed', response.message);
        }
      },
      (error) => {
        console.error('Something went wrong while verifying OTP', error);
      }
    );
  }

  resendOtp() {
    console.log('Resend OTP triggered for:', this.userEmail);
    this.otpForm.reset();
    this.startOtpTimer();

    this.sendOTPRequest();
  }

  goToSignIn() {
    this.router.navigate(['/public/login']);
  }

  resetUserForm() {
    this.signupForm.reset();
  }

  resetAdminForm() {
    this.adminFormGroup1.reset();
    this.adminFormGroup2.reset(); 
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

}
