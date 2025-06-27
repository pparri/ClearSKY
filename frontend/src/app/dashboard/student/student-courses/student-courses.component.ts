// src/app/dashboard/student/student-courses.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';

interface Review {
  id: number;
  reason: string;
  response?: string;
  status: string;
  submitted_at: string;
  responded_at?: string;
  semester: string;
  submission_type: string;
  grade_id: number;
}

interface Course {
  id?: number;       
  name: string;
  period: string;
  grade: number;
  hasRequestedReview: boolean;
  reviewStatus: 'Pending' | 'Accepted' | 'Rejected' | null;
  instructorReply?: string;
  reviewMessage?: string;
  initialDate?: string;
  finalDate?: string;
  gradeState?: 'OPEN' | 'CLOSED' | 'FINAL';  // ✅ 
  canRequestReview?: boolean;  // ✅ AÑADIR FLAG
  reviews?: Review[]; // ✅ Add reviews property
}

@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgChartsModule],
  templateUrl: './student-courses.component.html',
  styleUrls: ['./student-courses.component.scss']
})
export class StudentCoursesComponent implements OnInit {
  constructor(private api: ApiService) {}
  public barChartType: 'bar' = 'bar';
  currentDate = new Date();
  selectedCourse: Course | null = null;
  loading: boolean = false;
  error: string | null = null;
  selectedView: 'grades' | 'review' | 'status' | null = null;
  reviewMessage = '';
  submittedMessage = '';

  courses: Course[] = [];

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0
        }
      }
    }
  };
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: Array.from({ length: 11 }, (_, i) => i.toString()),
    datasets: [{ data: [], label: '', backgroundColor: [] }]
  };
showChart: any;

  ngOnInit(): void {
    this.loadStudentCourses(); 
  }

  loadStudentCourses(): void {
    this.loading = true;
    this.error = null;
  
    this.api.getStudentCourses().subscribe({
      next: (courses: any[]) => {
        console.log('📊 Respuesta del backend:', courses); // Debug

        // Mapear datos del backend al formato esperado
        this.courses = courses.map(course => ({
          name: course.name,
          period: course.period,
          grade: 0, // Por ahora, se calculará después
          hasRequestedReview: course.hasRequestedReview || false,
          reviewStatus: null,
          id: course.id,
          initialDate: course.initialDate,
          finalDate: course.finalDate,
          gradeState: course.gradeState || 'CLOSED',
          canRequestReview: course.canRequestReview || false

        }));
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error('❌ Error loading courses:', err);
        this.error = 'Failed to load courses';
        this.loading = false;
      }
    });
  }
  

  isSemesterOpen(period: string): boolean {
    const [season] = period.split(' ');
    const month = this.currentDate.getMonth() + 1;
    return season.toLowerCase() === 'spring'
      ? month >= 2 && month < 9
      : month >= 9 || month < 2;
  }

  viewGrades(course: Course): void {
    this.selectedCourse = course;
    this.selectedView = 'grades';
    this.submittedMessage = '';
    this.loading = true;
  
    // ✅ USAR DATOS REALES del API
    this.api.getStudentGradeDetails(String(course.id)).subscribe({
      next: (response) => {
        const grades = response.grades || [];
        
        if (grades.length > 0) {
          // Crear gráfico combinado como en el dashboard principal
          this.createStudentChart(grades, course);
          
          // Actualizar la nota del curso
          const latestGrade = grades[grades.length - 1];
          course.grade = latestGrade.grade_value || 0;
        } else {
          this.barChartData = { labels: ['No data'], datasets: [] };
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading grades:', error);
        this.barChartData = { labels: ['Error'], datasets: [] };
        this.loading = false;
      }
    });
  }
  
  // ✅ AÑADIR ESTE MÉTODO
  private createStudentChart(grades: any[], course: Course): void {
    // Preparar datos de notas generales
    const labels = grades.map((g: any) => 
      `${g.submission_type === 'initial' ? 'Initial' : 'Final'} (${g.semester})`
    );
    const generalData = grades.map((g: any) => g.grade_value || 0);
  
    // Obtener todas las preguntas únicas
    const allQuestions = new Set<string>();
    grades.forEach(grade => {
      Object.keys(grade.question_grades || {}).forEach(q => allQuestions.add(q));
    });
    const sortedQuestions = Array.from(allQuestions).sort();
  
    // Crear datasets
    const datasets: any[] = [
      {
        data: generalData,
        label: `General Grade - ${course.name}`,
        backgroundColor: '#3f51b5',
        borderColor: '#3f51b5',
        borderWidth: 2,
        type: 'line' as const,
        tension: 0.4
      }
    ];
  
    // Añadir colores para preguntas
    const questionColors = [
      '#e91e63', '#9c27b0', '#673ab7', '#2196f3', '#00bcd4', 
      '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ff9800',
      '#ff5722', '#795548', '#607d8b'
    ];
  
    sortedQuestions.forEach((question, index) => {
      const questionData = grades.map(grade => {
        const qGrades = grade.question_grades || {};
        return qGrades[question] || 0;
      });
  
      datasets.push({
        data: questionData,
        label: question,
        backgroundColor: questionColors[index % questionColors.length],
        borderColor: questionColors[index % questionColors.length],
        borderWidth: 1,
        type: 'bar' as const
      });
    });
  
    this.barChartData = {
      labels: labels,
      datasets: datasets
    };
  }

  showReviewForm(course: Course): void {
    this.selectedCourse = course;
    this.selectedView = 'review';
    this.submittedMessage = '';
  }

  sendReview(course: Course): void {
    if (!course.canRequestReview) {
      this.submittedMessage = '❌ Cannot request review for this course.';
      return;
    }
  
    if (course.hasRequestedReview) {
      this.submittedMessage = '❌ You have already requested a review for this course.';
      return;
    }
  
    if (!this.reviewMessage.trim()) {
      this.submittedMessage = '❌ Please write a review message.';
      return;
    }
  
    this.loading = true;
    
    // Encontrar una nota OPEN para este curso
    this.api.getStudentGradeDetails(String(course.id)).subscribe({
      next: (response) => {
        const grades = response.grades || [];
        const openGrade = grades.find((g: any) => g.state === 'OPEN');
        
        if (!openGrade) {
          this.submittedMessage = '❌ No open grades found for review.';
          this.loading = false;
          return;
        }
  
        this.requestReview(openGrade.id, this.reviewMessage, course);
      },
      error: (err) => {
        console.error('❌ Error getting grade details:', err);
        this.submittedMessage = '❌ Error processing review request.';
        this.loading = false;
      }
    });
  }

// En student-courses.component.ts - ACTUALIZAR sendReview
private requestReview(gradeId: number, reason: string, course: Course): void {
  this.api.requestReview(gradeId, reason).subscribe({
    next: (response) => {
      console.log('✅ Review request sent:', response);
      
      // ✅ ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE
      course.hasRequestedReview = true;
      course.canRequestReview = false;
      course.reviewStatus = 'Pending';
      course.reviewMessage = reason;
      
      // Actualizar la lista global
      const courseIndex = this.courses.findIndex(c => c.id === course.id);
      if (courseIndex !== -1) {
        this.courses[courseIndex] = { ...course };
      }
      
      this.reviewMessage = '';
      this.submittedMessage = '✅ Your review request has been sent to the instructor.';
      this.selectedView = null;
      this.loading = false;

      // ✅ REFRESCAR LOS DATOS DEL BACKEND PARA SINCRONIZAR
      this.refreshCourseData();
    },
    error: (err) => {
      console.error('❌ Error sending review:', err);
      
      if (err.error?.error && err.error.error.includes('Ya has enviado')) {
        course.hasRequestedReview = true;
        course.canRequestReview = false;
        this.submittedMessage = '❌ You have already requested a review for this course.';
      } else {
        this.submittedMessage = '❌ Failed to send review request.';
      }
      
      this.loading = false;
    }
  });
}

// ✅ AÑADIR MÉTODO PARA REFRESCAR DATOS
private refreshCourseData(): void {
  this.api.getStudentCourses().subscribe({
    next: (courses: any[]) => {
      // Mantener el curso seleccionado pero actualizar la lista
      const currentSelectedId = this.selectedCourse?.id;
      
      this.courses = courses.map(course => ({
        name: course.name,
        period: course.period,
        grade: 0,
        hasRequestedReview: course.hasRequestedReview || false,
        reviewStatus: null,
        id: course.id,
        initialDate: course.initialDate,
        finalDate: course.finalDate,
        gradeState: course.gradeState || 'CLOSED',
        canRequestReview: course.canRequestReview || false
      }));
      
      // Actualizar la referencia del curso seleccionado
      if (currentSelectedId && this.selectedCourse) {
        const updatedCourse = this.courses.find(c => c.id === currentSelectedId);
        if (updatedCourse) {
          this.selectedCourse = updatedCourse;
        }
      }
      
      console.log('🔄 Courses refreshed after review submission');
    },
    error: (err) => {
      console.error('❌ Error refreshing courses:', err);
    }
  });
}

// En student-courses.component.ts - MEJORAR viewReviewStatus
viewReviewStatus(course: Course): void {
  this.selectedCourse = course;
  this.selectedView = 'status';
  this.submittedMessage = '';
  this.loading = true;

  console.log('🔍 Viewing review status for course:', course.id);

  this.api.getStudentGradeDetails(String(course.id)).subscribe({
    next: (response) => {
      console.log('📋 Grade details response:', response);
      
      const grades = response.grades || [];
      
      // Extraer todas las reviews de todas las notas del curso
      const allReviews: Review[] = [];
      grades.forEach((grade: any) => {
        console.log('🔎 Checking grade:', grade.id, 'Reviews:', grade.review_requests);
        
        if (grade.review_requests && grade.review_requests.length > 0) {
          grade.review_requests.forEach((review: any) => {
            allReviews.push({
              id: review.id,
              reason: review.reason,
              response: review.response,
              status: review.response ? 'Responded' : 'Pending',
              submitted_at: review.submitted_at,
              responded_at: review.responded_at,
              semester: grade.semester,
              submission_type: grade.submission_type,
              grade_id: grade.id
            });
          });
        }
      });
      
      console.log('📝 All reviews found:', allReviews);
      
      if (this.selectedCourse) {
        this.selectedCourse.reviews = allReviews;
      }
      
      this.loading = false;
    },
    error: (err) => {
      console.error('❌ Error loading review status:', err);
      if (this.selectedCourse) {
        this.selectedCourse.reviews = [];
      }
      this.loading = false;
    }
  });
}



  getStatusMessage(course: Course): string {
    if (!course.hasRequestedReview) return 'N/A';
    if (course.reviewStatus === 'Pending') return '🕓 Instructor has not replied yet.';
    if (course.reviewStatus === 'Accepted') return '✅ Your review was accepted!';
    if (course.reviewStatus === 'Rejected') return '❌ Your review was rejected.';
    return '';
  }

getGradeStatusText(status?: string): string {
  switch(status) {
    case 'OPEN': return '🟢 Open for Review';
    case 'CLOSED': return '🔴 Closed';
    case 'FINAL': return '🔵 Final';
    default: return '❓ Unknown';
  }
}


getReviewButtonTitle(course: Course): string {
  if (course.hasRequestedReview) {
    return 'You have already requested a review for this course';
  }
  if (!course.canRequestReview) {
    return 'Reviews are not available for this course (grade must be OPEN)';
  }
  return 'Request a review for this course';
}



}
