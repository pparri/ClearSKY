import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

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
export class ViewGradesStatisticsComponent {
  courses: CourseStats[] = [
    {
      name: 'Software Engineering',
      period: 'Fall 2024',
      initialDate: '2024-10-01',
      finalDate: '2025-01-15'
    },
    {
      name: 'Physics',
      period: 'Spring 2025',
      initialDate: null,
      finalDate: null
    }
  ];

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

  toggleChart(course: CourseStats): void {
    if (!course.initialDate) {
      alert('📊 Post initial grades before viewing statistics.');
      return;
    }
    this.selectedCourse = this.selectedCourse === course ? null : course;
  }
}
