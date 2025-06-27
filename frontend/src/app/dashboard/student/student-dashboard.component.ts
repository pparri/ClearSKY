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
  initialDate: string;    
  finalDate: string;        
  initialSemester?: string;
  finalSemester?: string;
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
    if (this.selectedCourse === course) {
      this.selectedCourse = null;
      return;
    }
  
    this.selectedCourse = course;
    this.loading = true;
    
    // Cargar datos reales del estudiante
    this.api.getStudentGradeDetails(String(course.id)).subscribe({
      next: (response) => {
        console.log('📊 Datos del estudiante:', response);
        
        const grades = response.grades || [];
        
        if (grades.length > 0) {
          // Crear gráfico con las notas del estudiante
          const labels = grades.map((g: any) => 
            `${g.submission_type === 'initial' ? 'Initial' : 'Final'} (${g.semester})`
          );
          const data = grades.map((g: any) => g.grade_value || 0);
          
          this.barChartData = {
            labels: labels,
            datasets: [
              {
                data: data,
                label: `My Grades - ${course.name}`,
                backgroundColor: '#3f51b5',
                borderColor: '#3f51b5',
                borderWidth: 1
              }
            ]
          };
        } else {
          this.barChartData = { labels: ['No data'], datasets: [] };
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading student grades:', error);
        this.barChartData = { labels: ['Error'], datasets: [] };
        this.loading = false;
      }
    });
  }

  
  formatDate(date: any): string {
    // Check if the date is null, undefined, or otherwise invalid.
    if (!date || isNaN(new Date(date).getTime())) {
      return ''; // Return a default value
    }
    // If the date is valid, format it.
    // Replace with your actual formatting logic.
    return new Intl.DateTimeFormat('es-ES').format(new Date(date));
  }
}

