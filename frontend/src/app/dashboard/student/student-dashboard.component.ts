import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AuthService, User } from '../../auth/auth.service';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';



interface Course {
  id: number;
  name: string;
  period: string;
  initialDate: string;    
  finalDate: string;        
  initialSemester?: string;
  finalSemester?: string;
  semesters?: string[]; // Added property
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgChartsModule, FormsModule],
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


  selectedSemester: string | null = null;

selectCourse(course: Course, semesterOverride?: string): void {
  if (this.selectedCourse === course && !semesterOverride) {
    this.selectedCourse = null;
    return;
  }

  this.selectedCourse = course;
  this.selectedSemester = semesterOverride || (course.semesters ? course.semesters[0] : course.period);
  this.loading = true;

  const semester = this.selectedSemester || course.period || course.initialSemester || course.finalSemester || 'default-semester';
  this.api.getCourseGradeStatistics(String(course.id), semester).subscribe({
      next: (data) => {
        // Gráfico general
        this.barChartData = {
          labels: Array.from({ length: 11 }, (_, i) => i.toString()),
          datasets: [
            {
              label: `Initial Marks (${data.initial_student_count || 0} Students)`,
              data: data.general_grades_plot_data.initial?.values || [],
              backgroundColor: '#007bff',
              borderColor: '#007bff',
              borderWidth: 1
            },
            {
              label: `Final Marks (${data.final_student_count || 0} Students)`,
              data: data.general_grades_plot_data.final?.values || [],
              backgroundColor: '#dc3545',
              borderColor: '#dc3545',
              borderWidth: 1
            }
          ]
        };
  
        // Gráficos por pregunta
        this.questionCharts = {};
        if (data.question_grades_plot_data) {
          Object.keys(data.question_grades_plot_data).forEach(questionNum => {
            const questionData = data.question_grades_plot_data[questionNum];
            this.questionCharts[questionNum] = {
              labels: Array.from({ length: 11 }, (_, i) => i.toString()),
              datasets: [
                {
                  label: 'Inicial',
                  data: questionData.initial?.values || [],
                  backgroundColor: '#007bff',
                  borderColor: '#007bff',
                  borderWidth: 1
                },
                {
                  label: 'Final',
                  data: questionData.final?.values || [],
                  backgroundColor: '#dc3545',
                  borderColor: '#dc3545',
                  borderWidth: 1
                }
              ]
            };
          });
        }
  
        this.loading = false;
      },
      error: (error) => {
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

  public questionCharts: { [key: string]: ChartConfiguration<'bar'>['data'] } = {};
  public questionChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, font: { size: 12 } }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        ticks: { precision: 0 }
      }
    }
  };



}

