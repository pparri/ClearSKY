import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ReviewRequest } from '../../../services/api.service';

@Component({
  selector: 'app-review-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-requests.component.html',
  styleUrls: ['./review-requests.component.scss']
})
export class ReviewRequestsComponent implements OnInit {
  reviewRequests: ReviewRequest[] = [];
  selectedReview: ReviewRequest | null = null;
  instructorReply = '';
  instructorDecision: 'Accepted' | 'Rejected' | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadReviewRequests();
  }

  loadReviewRequests(): void {
    this.api.getReviewRequests().subscribe({
      next: (requests) => {
        this.reviewRequests = requests;
      },
      error: () => {
        alert('Failed to load review requests.');
      }
    });
  }

  selectReview(req: ReviewRequest): void {
    this.selectedReview = req;
    this.instructorReply = req.instructorReply || '';
    this.instructorDecision = req.reviewStatus === 'Pending' || req.reviewStatus === undefined ? null : req.reviewStatus;
  }

  submitReply(): void {
    if (!this.selectedReview || !this.instructorDecision || !this.instructorReply.trim()) {
      alert('Finish the selection please.');
      return;
    }
  
    // 🚀 CORREGIDO: Llamar al backend
    const response = `${this.instructorDecision}: ${this.instructorReply}`;
    
    this.api.respondToReview(this.selectedReview.id, response).subscribe({
      next: (result) => {
        console.log('✅ Respuesta enviada:', result);
        
        // Actualizar el estado local
        this.selectedReview!.reviewStatus = this.instructorDecision!;
        this.selectedReview!.instructorReply = response;
        
        // Limpiar formulario
        this.selectedReview = null;
        this.instructorReply = '';
        this.instructorDecision = null;
        
        // Recargar la lista
        this.loadReviewRequests();
        
        alert('Answer sended correctly');
      },
      error: (error) => {
        console.error(' Error sending the answer:', error);
        alert(` Error: ${error.error?.error || error.message}`);
      }
    });
  }
}
