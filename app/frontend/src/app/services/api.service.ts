import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, catchError, throwError } from 'rxjs';

export interface Course {
  id: string;
  name: string;
  period: string;
  initialDate: string;
  finalDate: string;
  initialSemester?: string;
  finalSemester?: string;
  gradeState?: 'OPEN' | 'CLOSED' | 'FINAL'; 
  canRequestReview?: boolean;  
}


export interface ReviewRequest {
  id: number;
  course: string;
  period: string;
  student: string;
  studentMessage: string;
  instructorReply?: string;
  reviewStatus?: 'Pending' | 'Accepted' | 'Rejected';
}

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  registration_id?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api/users';      // Usa il proxy
  private coursesUrl = '/api/courses'; // Usa il proxy
  private reviewsUrl = '/api/grades/reviews'; // Usa il proxy per le review
  private studentGradesUrl = '/api/grades/grades'; // Usa il proxy per le note dello studente
  private tokenKey = 'auth_token';

  private _isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this._isLoggedIn$.asObservable();

  constructor(private http: HttpClient) {}

  // Controlla se c'è token salvato nel localStorage
  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  // Imposta token nel localStorage
  private setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this._isLoggedIn$.next(true);
  }

  // Rimuove token
  logout() {
    localStorage.removeItem(this.tokenKey);
    this._isLoggedIn$.next(false);
  }

  // Ottieni token salvato
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Header con token per richieste autenticate
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Token ${token}` } : {})
    });
  }
  //UploadExcel
  uploadExcel(formData: FormData): Observable<any> {
    const token = this.getToken();
    const headers = token ? new HttpHeaders({ 'Authorization': `Token ${token}` }) : undefined;
    return this.http.post('/api/grades/upload-excel/', formData, { headers });
  }

  // Registro utente
  register(userData: {username: string, email: string, name: string, password: string, role: string}): Observable<any> {
    return this.http.post(`${this.baseUrl}/register/`, userData, { headers: new HttpHeaders({'Content-Type': 'application/json'}) });
  }

  // Login utente e salvataggio token
  login(credentials: {username: string, password: string}): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login/`, credentials, { headers: new HttpHeaders({'Content-Type': 'application/json'}) })
      .pipe(
        tap(response => {
          this.setToken(response.token);
        })
      );
  }

  // Ottieni profilo utente autenticato
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me/`, { headers: this.getAuthHeaders() });
  }

  // Ottieni tutti i corsi (per istruttore)
  getInstructorCourses(): Observable<Course[]> {
    return this.http.get<any[]>(`${this.coursesUrl}/`, { headers: this.getAuthHeaders() }).pipe(
      map(backendCourses => backendCourses.map(course => ({
        id: String(course.id),
        name: course.title,
        period: course.period || 'N/A', // Fallback se period non è presente
        initialDate: course.initial_submission_date,
        finalDate: course.final_submission_date
      })))
    );
  }

  getCourseStatistics(): Observable<Course[]> {
    return this.http.get<any[]>('/api/courses/statistics/', { headers: this.getAuthHeaders() }).pipe(
      map(stats => stats.map(stat => ({
        id: String(stat.id),
        name: stat.name,
        period: stat.period || 'N/A', // Fallback se period non è presente
        initialDate: stat.initialDate,
        finalDate: stat.finalDate,
        initialSemester: stat.initialSemester,
        finalSemester: stat.finalSemester
      })))
    );
  }

  getCourseGradeStatistics(courseId: string, semester: string): Observable<any> {
    const url = `/api/grades/courses/${courseId}/semester/${encodeURIComponent(semester)}/statistics/`;
    console.log(`🌐 Llamando a URL: ${url}`); // Debug
    
    return this.http.get<any>(url, { headers: this.getAuthHeaders() }).pipe(
      tap(response => console.log('📊 Respuesta del servidor:', response)), // Debug
      catchError(error => {
        console.error('🚨 Error en API call:', error);
        return throwError(() => error);
      })
    );
  }

   // Ottieni dettagli di un corso
   getCourse(courseId: string): Observable<Course> {
    return this.http.get<Course>(`${this.coursesUrl}/${courseId}/`, { headers: this.getAuthHeaders() });
  }

  // Ottieni tutti i corsi (per studente)
  getCourseStats(courseId: string): Observable<{ labels: string[]; data: number[] }> {
    // Para estudiantes, mostrar sus propias notas
    return this.getStudentGradeDetails(courseId).pipe(
      map(response => {
        const grades = response.grades || [];
        
        if (grades.length === 0) {
          return { labels: [], data: [] };
        }
        
        // Crear gráfico con las notas del estudiante
        const labels = grades.map((g: any) => `${g.submission_type} (${g.semester})`);
        const data = grades.map((g: any) => g.grade_value || 0);
        
        return { labels, data };
      })
    );
  }

  // Ottieni richieste di revisione per l'istruttore
  getReviewRequests(): Observable<ReviewRequest[]> {
    return this.http.get<any[]>(`/api/grades/reviews/`, { headers: this.getAuthHeaders() }).pipe(
      map(requests => requests.map(req => ({
        id: req.id,
        course: req.grade_assignment?.course?.title || 'Unknown Course',
        period: req.grade_assignment?.semester || 'Unknown Period', 
        student: req.grade_assignment?.student?.name || 'Unknown Student',
        studentMessage: req.reason,
        instructorReply: req.response || '',
        reviewStatus: this.mapReviewStatus(req.response) // Mapear estado basado en respuesta
      })))
    );
  }

  respondToReview(reviewId: number, response: string): Observable<any> {
    return this.http.post(`/api/grades/reviews/${reviewId}/respond/`, 
      { response }, 
      { headers: this.getAuthHeaders() }
    );
  }
  //Helper method to map review status based on response
  private mapReviewStatus(response: string | null): 'Pending' | 'Accepted' | 'Rejected' {
    if (!response) {
      return 'Pending';
    }
    
    // 🚀 CORREGIDO: Mapear basado en el contenido de la respuesta
    const responseLower = response.toLowerCase();
    
    if (responseLower.startsWith('accepted')) {
      return 'Accepted';
    } else if (responseLower.startsWith('rejected')) {
      return 'Rejected';
    }
    
    // Si tiene respuesta pero no empieza con accepted/rejected, asumir que está respondida
    return 'Accepted'; // Por defecto
  }

  getStudentCourses(): Observable<Course[]> {
    console.log('🔑 Token usado:', this.getToken());
    return this.http.get<any[]>('/api/courses/student-courses/', { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map(backendCourses => backendCourses.map(course => ({
        id: String(course.id),
        name: course.name, 
        period: course.period || 'N/A',
        initialDate: course.initialDate,
        finalDate: course.finalDate,
        gradeState: course.gradeState || 'CLOSED', 
        canRequestReview: course.canRequestReview || false,
        hasRequestedReview: course.hasRequestedReview || false

      }))),
      tap(response => console.log('📋 Cursos mapeados:', response)),
      catchError(error => {
        console.error('🚨 Error en getStudentCourses:', error);
        return throwError(() => error);
      })
    );
  }

  getStudentGradeDetails(courseId: string): Observable<any> {
    return this.http.get<any>(`/api/grades/student-course/${courseId}/`, { 
      headers: this.getAuthHeaders() 
    });
  }

  requestReview(gradeId: number, reason: string): Observable<any> {
    return this.http.post(`/api/grades/grades/${gradeId}/request-review/`, 
      { reason }, 
      { headers: this.getAuthHeaders() }
    );
  }

  getStudentReviewStatus(courseId: string): Observable<any> {
    // Usar el endpoint existente que ya tienes
    return this.http.get(`/api/grades/grades/`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      map(response => {
        // Filtrar solo las notas del curso específico
        const grades = Array.isArray(response) ? response : [];
        const courseGrades = grades.filter((grade: any) => 
          String(grade.course?.id) === courseId || String(grade.course) === courseId
        );
        
        // Extraer información de reviews de las notas
        const reviews = courseGrades
          .filter((grade: any) => grade.review_requests && grade.review_requests.length > 0)
          .flatMap((grade: any) => grade.review_requests.map((review: any) => ({
            ...review,
            grade_id: grade.id,
            semester: grade.semester
          })));
        
        return {
          course_name: courseGrades[0]?.course?.title || 'Unknown Course',
          reviews: reviews
        };
      })
    );
  }


}
