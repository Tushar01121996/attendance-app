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
  selector: 'app-resetpassword',
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
  templateUrl: './resetpassword.component.html',
  styleUrl: './resetpassword.component.scss'
})
export class ResetpasswordComponent {
fgForm: FormGroup;
email:string ='';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.fgForm = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    {
        validators: (form) => {
          return form.get('password')?.value === form.get('confirmPassword')?.value
            ? null
            : { passwordMismatch: true };
        }
      });
    this.email = this.router.getCurrentNavigation()?.extras.state?.['email']||'';
  }

  onSubmit() {
    if (this.fgForm.valid) {
      debugger
      const formData = {
        userName : this.email,
        password : this.fgForm.value.password,
        confirmPassword : this.fgForm.value.confirmPassword,
      };
      this.authService.updatePassword(formData).subscribe({
        next : (response) =>{
          this.snack.open(response.msg, 'OK', { duration: 2000 });
          this.router.navigate(['/login'])
        },
        error:(error)=>{
          const errorMessage = error.error.msg || 'Something went wrong';
          this.snack.open(errorMessage, 'OK', { duration: 2000 });
        }
      })
    }
  }
}
