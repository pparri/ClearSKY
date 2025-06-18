import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ReviewRequest {
  course: string;
  period: string;
  student: string;
  studentMessage: string;
  instructorReply?: string;
  reviewStatus?: 'Accepted' | 'Rejected';
}

@Component({
  selector: 'app-review-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-requests.component.html',
  styleUrls: ['./review-requests.component.scss']
})
export class ReviewRequestsComponent {
  reviewRequests: ReviewRequest[] = [
    {
      course: 'Software Engineering',
      period: 'Fall 2024',
      student: 'Alice Smith',
      studentMessage: 'I believe my grade is too low. Please check again.'
    }
  ];

  selectedReview: ReviewRequest | null = null;
  instructorReply = '';
  instructorDecision: 'Accepted' | 'Rejected' | null = null;

  selectReview(req: ReviewRequest): void {
    this.selectedReview = req;
    this.instructorReply = req.instructorReply || '';
    this.instructorDecision = req.reviewStatus || null;
  }

  submitReply(): void {
    if (this.selectedReview && this.instructorDecision) {
      this.selectedReview.reviewStatus = this.instructorDecision;
      this.selectedReview.instructorReply = this.instructorReply;
      alert(`Reply sent to ${this.selectedReview.student}`);
    }
  }
}
