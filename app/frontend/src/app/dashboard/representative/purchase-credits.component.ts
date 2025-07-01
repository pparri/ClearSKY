import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchase-credits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase-credits.component.html',
  styleUrls: ['./purchase-credits.component.scss']
})
export class PurchaseCreditsComponent {
  selectedAmount = 0;
  message: string | null = null;

  purchase(): void {
    if (this.selectedAmount > 0) {
      this.message = `✅ Purchased ${this.selectedAmount} credits successfully!`;
      this.selectedAmount = 0;
    } else {
      this.message = '❌ Please select a valid amount.';
    }
  }
}