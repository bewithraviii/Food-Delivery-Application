import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  logo: string = 'assets/svg/logo.svg';

  loginForm!: FormGroup;

  passwordVisible: boolean = false;
  
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    })
  }

    // password visibility
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

}
