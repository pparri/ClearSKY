import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  type: 'student' | 'instructor' | 'representative';
  email: string;
  password: string;
  id: string;
  institution: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent {
  userTypes: User['type'][] = ['student', 'instructor', 'representative'];
  institutions = ['NTUA', 'MIT', 'Stanford'];
  selectedType: User['type'] = 'representative';
  selectedInstitution: string = 'NTUA';

  email = '';
  password = '';
  id = '';
  success = '';
  error = '';

  users: User[] = [];

  resetMessages(): void {
    this.success = '';
    this.error = '';
  }

  validateEmailDomain(): boolean {
    const domain = this.selectedInstitution.toLowerCase();
    const regex = new RegExp(`@${domain}\\b`, 'i');
    return regex.test(this.email);
  }

  addUser(): void {
    this.resetMessages();

    if (!this.email || !this.password || !this.id) {
      this.error = 'Please fill in all the fields.';
      return;
    }

    if (!this.validateEmailDomain()) {
      this.error = `Email must contain @${this.selectedInstitution.toLowerCase()}`;
      return;
    }

    const emailExists = this.users.some(u => u.email === this.email);
    const idExists = this.users.some(u => u.id === this.id);

    if (emailExists) {
      this.error = 'User with this email already exists.';
      return;
    }

    if (idExists) {
      this.error = 'User ID already exists.';
      return;
    }

    this.users.push({
      type: this.selectedType,
      email: this.email,
      password: this.password,
      id: this.id,
      institution: this.selectedInstitution
    });

    this.success = '✅ User added successfully.';
    this.clearForm();
  }

  changePassword(): void {
    this.resetMessages();

    if (!this.email || !this.password || !this.id) {
      this.error = 'Please fill in all the fields.';
      return;
    }

    if (!this.validateEmailDomain()) {
      this.error = `Email must contain @${this.selectedInstitution.toLowerCase()}`;
      return;
    }

    const user = this.users.find(u => u.email === this.email && u.id === this.id);
    if (!user) {
      this.error = 'User not found with this email and ID.';
      return;
    }

    user.password = this.password;
    this.success = '✅ Password updated successfully.';
    this.clearForm();
  }

  clearForm(): void {
    this.email = '';
    this.password = '';
    this.id = '';
  }
}
