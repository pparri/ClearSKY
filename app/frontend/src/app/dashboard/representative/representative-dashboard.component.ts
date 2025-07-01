import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-representative-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './representative-dashboard.component.html',
  styleUrls: ['./representative-dashboard.component.scss']
})
export class RepresentativeDashboardComponent {}