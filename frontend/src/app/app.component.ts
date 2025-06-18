import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';  // <-- import HttpClientModule

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, HttpClientModule],  // <-- aggiunto qui
  template: `
    <div class="app-container">
      <!-- Header -->
      <header *ngIf="isLoggedIn">
        <h1>clearSKY</h1>
        <button (click)="logout()">Logout</button>
      </header>

      <main>
        <router-outlet></router-outlet>  
      </main>

      <footer>
        <p>NTUA - Software as a Service 2024-2025</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    header {
      background: #3f51b5;
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    main {
      flex: 1;
      padding: 2rem;
    }
    footer {
      background: #f5f5f5;
      padding: 1rem;
      text-align: center;
    }
  `]
})
export class AppComponent {
  title = 'clearSKY';
  isLoggedIn = false;

  logout() {
    this.isLoggedIn = false;
  }
}
