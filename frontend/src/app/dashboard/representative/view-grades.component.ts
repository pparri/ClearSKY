import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-view-grades',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './view-grades.component.html',
  styleUrls: ['./view-grades.component.scss']
})
export class ViewGradesComponent implements OnInit {
  institutions = ['NTUA', 'MIT'];
  selectedInstitution = '';
  searchAttempted = false;

  courses: {
    name: string;
    period: string;
    initialDate?: string;
    finalDate?: string;
    grades: number[];
  }[] = [];

  selectedCourse: any = null;

  barChartOptions: ChartOptions<'bar'> = { responsive: true };
  barChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };

  ngOnInit(): void {}

  searchCourses(): void {
    this.searchAttempted = true;
    if (this.selectedInstitution === 'NTUA') {
      this.courses = [
        { name: 'Physics', period: 'Spring 2025', initialDate: '2025-02-10', finalDate: '', grades: [7, 8, 9, 7, 6] },
        { name: 'Math', period: 'Fall 2024', grades: [5, 6, 7, 4, 3] }
      ];
    } else {
      this.courses = [];
    }
    this.selectedCourse = null;
  }

  toggleChart(course: any): void {
    if (this.selectedCourse === course) {
      this.selectedCourse = null;
      return;
    }

    this.selectedCourse = course;

    const labels = Array.from({ length: 11 }, (_, i) => i.toString());
    const counts = new Array(11).fill(0);
    course.grades.forEach((g: number) => counts[g]++);

    this.barChartData = {
      labels,
      datasets: [{
        data: counts,
        label: `${course.name} Grades`,
        backgroundColor: '#3f51b5'
      }]
    };
  }
}
