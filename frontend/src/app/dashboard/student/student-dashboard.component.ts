import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AuthService, User } from '../../auth/auth.service';
import { ApiService } from '../../services/api.service';

interface Course {
  id: number;
  name: string;
  period: string;
  initialSubmission: string; // ISO string dal backend
  finalSubmission: string;   // ISO string dal backend
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgChartsModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
  user: User | null = null;
  courses: Course[] = [];
  selectedCourse: Course | null = null;

  barChartType: 'bar' = 'bar';
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  loading = false;
  error: string | null = null;

  constructor(private auth: AuthService, private api: ApiService) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser;
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.api.getStudentCourses().subscribe({
      next: (courses) => {
        this.courses = courses.map(course => ({
          ...course,
          id: Number(course.id)
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load courses';
        this.loading = false;
      }
    });
  }

  selectCourse(course: Course): void {
    this.selectedCourse = course;
    // Carica statistiche reali dal backend
    this.api.getCourseStats(String(course.id)).subscribe({
      next: (stats) => {
        this.barChartData = {
          labels: stats.labels,
          datasets: [
            {
              data: stats.data,
              label: course.name,
              backgroundColor: '#3f51b5'
            }
          ]
        };
      },
      error: () => {
        this.barChartData = { labels: [], datasets: [] };
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('en-GB').format(new Date(dateStr));
  }
}
