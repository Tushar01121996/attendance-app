import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-forgotpassword',
   imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule,
    MatIcon
  ],
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.scss'
})
export class ForgotpasswordComponent {
fgForm: FormGroup;
isVisible = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.fgForm = this.fb.group({
      toEmail: ['', Validators.required],
      otp: [''],
    });
  }

  onSubmit() {
    if (this.fgForm.valid) {
      const email = this.fgForm.value.toEmail;
      debugger
      if(!this.isVisible){
      this.authService.SendOtpMail(this.fgForm.value).subscribe({
        next : (response) =>{
          this.snack.open(response.msg, 'OK', { duration: 2000 });
          this.isVisible = true;
        },
        error:(error)=>{
          const errorMessage = error.error.msg || 'Something went wrong';
          this.snack.open(errorMessage, 'OK', { duration: 2000 });
        }
      })
    }
    else{
      this.authService.verifyOtp(this.fgForm.value).subscribe({
        next : (response) =>{
          this.snack.open(response.msg, 'OK', { duration: 2000 });
          this.router.navigate(['/resetpassword'], { state: { email: this.fgForm.value.toEmail } });
        },
        error:(error)=>{
          debugger
          const errorMessage = error?.error?.msg || error?.message || 'Something went wrong';
          this.snack.open(errorMessage, 'OK', { duration: 2000 });
        }
      })
    }
      
    }
  }
}
