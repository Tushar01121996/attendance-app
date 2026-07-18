import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';



@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  standalone: true,  // ✅ Angular 19 standalone component
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
loginForm: FormGroup;
hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe:['']
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(this.loginForm.value).subscribe({
        next : (response) =>{
         localStorage.setItem('token', response.token);
         localStorage.setItem('refreshToken', response.refreshToken);
         localStorage.setItem('displayName', response.data);
         this.router.navigate(['/dashboard']);
        },
        error:(error)=>{
          this.snack.open('Invalid Password', 'OK', { duration: 1400 });
          localStorage.setItem('token', '');  
        }
      })
      
    }
  }
  forgotPassword():void{
    this.router.navigate(['/forgotpassword']);
  }
}
