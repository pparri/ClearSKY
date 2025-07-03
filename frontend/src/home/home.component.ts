
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Welcome Home!</h1>
    <p>This is the home page of your application.</p>
  `,
  styles: [`
    h1 { color: #3f51b5; }
  `]
})
export class HomeComponent { }