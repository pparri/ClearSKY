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

          // Salva il token se il backend lo restituisce
          if (response.token) {
            localStorage.setItem('auth_token', response.token);
            // Aggiorna lo stato utente nell'AuthService
            this.auth.login({
              email: response.user.email,
              role: response.user.role as 'student' | 'instructor' | 'representative',
              name: response.user.name
            });
            this.router.navigate(['/']);
            this.errorMessage = null;
          } else {
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
