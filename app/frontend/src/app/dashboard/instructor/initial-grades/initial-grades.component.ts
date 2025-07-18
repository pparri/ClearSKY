// src/app/dashboard/instructor/initial-grades/initial-grades.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ApiService, Course } from '../../../services/api.service';

@Component({
  selector: 'app-initial-grades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './initial-grades.component.html',
  styleUrls: ['./initial-grades.component.scss']
})
export class InitialGradesComponent implements OnInit {
  courses: Course[] = [];
  selectedCourse: Course | null = null;
  fileName = '';
  parsedHeaders: string[] = [];
  parsedRows: any[][] = [];
  selectedFile: File | null = null; // Declare the selectedFile property
  message: string | null = null;
  uploadConfirmed = false;

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
    this.selectedFile = file; // Save the file to the selectedFile property
    this.fileName = file.name;
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

  manualSemester: string = ''; // Añade esta propiedad

//Semester manual
  confirmUpload(): void {
  if (!this.manualSemester) {
    this.message = 'You need the semester.';
    return;
  }
  // Aquí tu lógica para subir el archivo, por ejemplo:
  const formData = new FormData();
  if (this.selectedFile) {
    formData.append('file', this.selectedFile); // asegúrate de guardar el archivo en onFileChange
  } else {
    this.message = '❌ No file selected.';
    return;
  }
  formData.append('course_name', this.selectedCourse?.name || '');
  formData.append('semester', this.manualSemester.trim());
  formData.append('submission_type', 'initial'); // Asegúrate de que este valor sea correcto según tu API

  // Llama a tu servicio para hacer el POST
  this.api.uploadExcel(formData).subscribe({
    next: (res) => this.message = '✅ Excel subido correctamente.',
    error: (err) => this.message = '❌ Error al subir el Excel.'
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
