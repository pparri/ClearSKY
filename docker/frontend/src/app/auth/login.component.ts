import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';   // Senza .js
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required], // Cambiato da email a username
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.api.login({ username, password }).subscribe({
        next: (response) => {
          // Log di debug per vedere la risposta
          console.log('Login response:', response);

          // Salva il token e utente se il backend li restituisce
          if (response.token && response.user) {
            this.auth.setCurrentUser(response.user, response.token);
            const userRole = response.user.role;
            
            switch (userRole) {
              case 'instructor':
                this.router.navigate(['/instructor/instructor-dashboard']);
                break;
              case 'student':
                this.router.navigate(['/student/student-dashboard']);
                break;
              case 'representative':
                this.router.navigate(['/representative/dashboard']);
                break;
            }
          } 
          else {
            this.errorMessage = 'Invalid credentials or server error';
          }
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Invalid credentials or server error';
        }
      });
    }
  }
}
