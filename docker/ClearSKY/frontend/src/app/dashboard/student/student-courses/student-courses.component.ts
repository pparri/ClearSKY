// src/app/dashboard/student/student-courses.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Course {
  name: string;
  period: string;
  grade: number;
  hasRequestedReview: boolean;
  reviewStatus: 'Pending' | 'Accepted' | 'Rejected' | null;
  instructorReply?: string;
  reviewMessage?: string;
}

@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgChartsModule],
  templateUrl: './student-courses.component.html',
  styleUrls: ['./student-courses.component.scss']
})
export class StudentCoursesComponent implements OnInit {
  public barChartType: 'bar' = 'bar';
  currentDate = new Date();
  selectedCourse: Course | null = null;
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
    this.loadMockCourses();
  }

  loadMockCourses(): void {
    this.courses = [
      {
        name: 'Physics',
        period: 'Spring 2025',
        grade: 6,
        hasRequestedReview: false,
        reviewStatus: null
      },
      {
        name: 'Software',
        period: 'Fall 2024',
        grade: 4,
        hasRequestedReview: true,
        reviewStatus: 'Pending',
        reviewMessage: 'I think my grade should be higher.'
      },
      {
        name: 'Mathematics',
        period: 'Fall 2024',
        grade: 7,
        hasRequestedReview: false,
        reviewStatus: null
      }
    ];
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

    const counts = new Array(11).fill(0);
    this.courses.forEach(c => counts[c.grade]++);

    const colors = counts.map((_, index) =>
      index === course.grade ? '#c62828' : '#3f51b5'
    );

    this.barChartData = {
      labels: counts.map((_, i) => i.toString()),
      datasets: [
        {
          data: counts,
          label: `${course.name} Grades`,
          backgroundColor: colors
        }
      ]
    };
  }

  showReviewForm(course: Course): void {
    this.selectedCourse = course;
    this.selectedView = 'review';
    this.submittedMessage = '';
  }

  sendReview(course: Course): void {
    if (!course.hasRequestedReview && this.isSemesterOpen(course.period)) {
      course.hasRequestedReview = true;
      course.reviewStatus = 'Pending';
      course.reviewMessage = this.reviewMessage;
      this.reviewMessage = '';
      this.submittedMessage = '✅ Your review request has been sent to the instructor.';
      this.selectedView = null;
    }
  }

  viewReviewStatus(course: Course): void {
    this.selectedCourse = course;
    this.selectedView = 'status';
    this.submittedMessage = '';
  }

  getStatusMessage(course: Course): string {
    if (!course.hasRequestedReview) return 'N/A';
    if (course.reviewStatus === 'Pending') return '🕓 Instructor has not replied yet.';
    if (course.reviewStatus === 'Accepted') return '✅ Your review was accepted!';
    if (course.reviewStatus === 'Rejected') return '❌ Your review was rejected.';
    return '';
  }
}
