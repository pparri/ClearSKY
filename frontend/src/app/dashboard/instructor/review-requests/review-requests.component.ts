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
    if (this.selectedReview && this.instructorDecision) {
      this.selectedReview.reviewStatus = this.instructorDecision;
      this.selectedReview.instructorReply = this.instructorReply;
      alert(`Reply sent to ${this.selectedReview.student}`);
    }
  }
}
