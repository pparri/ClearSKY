import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ApiService, Course } from '../../../services/api.service';

interface CourseStats {
  id: string;
  name: string;
  period: string | null;
  initialDate: string | null;
  finalDate: string | null;
  initialSemester: string | null;
  finalSemester: string | null;
}

@Component({
  selector: 'app-view-grades-statistics',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './grade-statistics.component.html',
  styleUrls: ['./grade-statistics.component.scss']
})
export class ViewGradesStatisticsComponent implements OnInit {
  courses: CourseStats[] = [];
  selectedCourse: CourseStats | null = null;
  loading: boolean = false;
  chartDataLoaded: boolean = false;

  // Gráfico general  
  public chartData: ChartConfiguration<'bar'>['data'] = {
    labels: Array.from({ length: 11 }, (_, i) => i.toString()),
    datasets: [
      {
        label: 'Inital Submission',
        data: [],
        backgroundColor: '#007bff',
        borderColor: '#007bff',
        borderWidth: 1
      },
      {
        label: 'Final Submission',
        data: [],
        backgroundColor: '#dc3545',
        borderColor: '#dc3545',
        borderWidth: 1
      }
    ]
  };

  public chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Course Grades Statistics',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  // Gráficos de preguntas
  public questionCharts: { [key: string]: ChartConfiguration<'bar'>['data'] } = {};
  public questionChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        font: { size: 12 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  
  constructor(private api: ApiService, private router: Router) {}
  
  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.api.getCourseStatistics().subscribe({
      next: (courses: any[]) => {
        this.courses = courses.map(course => ({
          id: course.id,
          name: course.name,
          period: course.period,
          initialDate: course.initialDate,
          finalDate: course.finalDate,
          initialSemester: course.initialSemester,
          finalSemester: course.finalSemester,
        }));
      },
      error: () => {
        alert(' Failed to load courses statistics.');
      }
    });
  }

  toggleChart(course: CourseStats): void {
    if (!course.initialDate && !course.finalDate) {
      alert('📊 No marks available for this course.');
      return;
    }

    // ✅ CORREGIDO: Mostrar/ocultar gráfico en lugar de redirigir
    if (this.selectedCourse === course) {
      this.selectedCourse = null;
      this.chartDataLoaded = false;
      return;
    }

    this.selectedCourse = course;
    this.loadCourseStatistics(course); // ✅ Llamar al método que carga datos
  }

  loadCourseStatistics(course: CourseStats): void {
    this.loading = true;
    this.chartDataLoaded = false;

    const semester = course.period || course.initialSemester || course.finalSemester;
    
    if (!semester) {
      alert('Incorrect semester');
      this.loading = false;
      return;
    }

    this.api.getCourseGradeStatistics(course.id, semester).subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);

        // Actualizar gráfico general con ambos datasets
        if (data.general_grades_plot_data) {
          // Dataset inicial
          if (data.general_grades_plot_data.initial?.values) {
            this.chartData.datasets[0].data = data.general_grades_plot_data.initial.values;
            this.chartData.datasets[0].label = `Initial Marks (${data.initial_student_count || 0} Students)`;
          }
          
          // Dataset final
          if (data.general_grades_plot_data.final?.values) {
            this.chartData.datasets[1].data = data.general_grades_plot_data.final.values;
            this.chartData.datasets[1].label = `Final Marks (${data.final_student_count || 0} Students)`;
          }
        }

        // Actualizar gráficos de preguntas
        this.questionCharts = {};
        if (data.question_grades_plot_data) {
          Object.keys(data.question_grades_plot_data).forEach(questionNum => {
            const questionData = data.question_grades_plot_data[questionNum];
            
            this.questionCharts[questionNum] = {
              labels: Array.from({ length: 11 }, (_, i) => i.toString()),
              datasets: [
                {
                  label: 'Initial',
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

        this.chartDataLoaded = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        alert('Error loading statistics.');
        this.loading = false;
      }
    });
  }

  getQuestionColor(questionNum: string): string {
    const colors = [
      '#007bff', '#28a745', '#ffc107', '#dc3545', 
      '#6f42c1', '#20c997', '#fd7e14', '#e83e8c',
      '#6c757d', '#17a2b8'
    ];
    const index = parseInt(questionNum.replace('Q', '').replace('0', '')) - 1;
    return colors[index % colors.length];
  }

  getQuestionKeys(): string[] {
    return Object.keys(this.questionCharts).sort();
  }
}