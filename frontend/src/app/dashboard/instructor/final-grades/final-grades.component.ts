// src/app/dashboard/instructor/final-grades/final-grades.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ApiService, Course } from '../../../services/api.service';

@Component({
  selector: 'app-final-grades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './final-grades.component.html',
  styleUrls: ['./final-grades.component.scss']
})
export class FinalGradesComponent implements OnInit {
  courses: Course[] = [];
  selectedCourse: Course | null = null;
  fileName = '';
  parsedHeaders: string[] = [];
  parsedRows: any[][] = [];
  message: string | null = null;
  uploadConfirmed = false;
  selectedFile: File | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.api.getInstructorCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
      },
      error: () => {
        this.message = '❌ Failed to load courses.';
      }
    });
  }

  onCourseSelect(): void {
    this.resetUpload();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.selectedCourse) return;
    const file = input.files[0];
    this.selectedFile = file;
    this.fileName = file.name;
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array((e.target as any).result);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        this.parsedHeaders = json[0] as string[];
        this.parsedRows = json.slice(1) as any[][];
        this.message = `✅ Parsed ${this.parsedRows.length} rows.`;
        this.uploadConfirmed = false;
      } catch {
        this.message = '❌ Failed to parse Excel file.';
        this.parsedHeaders = [];
        this.parsedRows = [];
      }
    };

    reader.readAsArrayBuffer(file);
  }
  manualSemester: string = '';

  confirmUpload(): void {
    if (!this.manualSemester) {
      this.message = 'You need the semester.';
      return;
    }
    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    } else {
      this.message = '❌ No file selected.';
      return;
    }
    formData.append('course_name', this.selectedCourse?.name || '');
    formData.append('semester', this.manualSemester.trim());
    formData.append('submission_type', 'final');
    
    this.api.uploadExcel(formData).subscribe({
      next: () => this.message = '✅ Excel subido correctamente.',
      error: () => this.message = '❌ Error al subir el Excel.'
    });
  }

  cancelUpload(): void {
    this.resetUpload();
    this.message = '❌ Upload canceled.';
  }

  private resetUpload(): void {
    this.fileName = '';
    this.parsedHeaders = [];
    this.parsedRows = [];
    this.uploadConfirmed = false;
    this.message = null;
  }
}
