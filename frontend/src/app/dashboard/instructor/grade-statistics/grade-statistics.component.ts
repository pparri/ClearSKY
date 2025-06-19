import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ApiService, Course } from '../../../services/api.service';

interface CourseStats {
  name: string;
  period: string;
  initialDate: string | null;
  finalDate: string | null;
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

  public chartData: ChartConfiguration<'bar'>['data'] = {
    labels: Array.from({ length: 11 }, (_, i) => i.toString()),
    datasets: [
      {
        label: 'Grades',
        data: [0, 0, 0, 2, 5, 3, 6, 8, 4, 1, 0],
        backgroundColor: '#3f51b5'
      }
    ]
  };

  public chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        ticks: {
          precision: 0
        }
      }
    }
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.api.getInstructorCourses().subscribe({
      next: (courses: Course[]) => {
        this.courses = courses.map(c => ({
          name: c.name,
          period: c.period,
          initialDate: c.initialSubmission,
          finalDate: c.finalSubmission
        }));
      },
      error: () => {
        alert('❌ Failed to load courses statistics.');
      }
    });
  }

  toggleChart(course: CourseStats): void {
    if (!course.initialDate) {
      alert('📊 Post initial grades before viewing statistics.');
      return;
    }
    this.selectedCourse = this.selectedCourse === course ? null : course;
  }
}
