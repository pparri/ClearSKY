import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-institution',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-institution.component.html',
  styleUrls: ['./register-institution.component.scss']
})
export class RegisterInstitutionComponent {
  institutionName = '';
  institutionCode = '';
  message: string | null = null;

  registerInstitution(): void {
    if (this.institutionName && this.institutionCode) {
      // simulazione salvataggio
      this.message = `✅ Institution "${this.institutionName}" registered successfully!`;
      this.institutionName = '';
      this.institutionCode = '';
    } else {
      this.message = '❌ Please fill in all fields.';
    }
  }
}
