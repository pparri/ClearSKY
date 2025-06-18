import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface Course {
  id: string;
  name: string;
  period: string;
  initialSubmission: string;
  finalSubmission: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
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

  // Ottieni tutti i corsi (per studente)
  getStudentCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.coursesUrl}/`, { headers: this.getAuthHeaders() });
  }

  // Ottieni dettagli di un corso
  getCourse(courseId: string): Observable<Course> {
    return this.http.get<Course>(`${this.coursesUrl}/${courseId}/`, { headers: this.getAuthHeaders() });
  }

  getCourseStats(courseId: string): Observable<{ labels: string[]; data: number[] }> {
    return this.http.get<{ labels: string[]; data: number[] }>(
      `${this.coursesUrl}/${courseId}/stats/`,
      { headers: this.getAuthHeaders() }
    );
  }
}
