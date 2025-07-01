import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DoctorService } from '../../core/services/doctor.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

// Component declaration
@Component({
  selector: 'app-doctor-form',
  templateUrl: './doctor-form.html',
  styleUrls: ['./doctor-form.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule
  ]
})
export class DoctorFormComponent {
  doctorForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.doctorForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      specialty: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.doctorForm.invalid) {
      return;
    }

    this.isLoading = true;
    try {
      const doctorData = this.doctorForm.value;
      await this.doctorService.addDoctor(doctorData);

      this.snackBar.open('Médecin ajouté avec succès', 'Fermer', {
        duration: 3000
      });

      this.router.navigate(['/doctors']);
    } catch (error) {
      this.snackBar.open("Erreur lors de l'ajout du médecin", 'Fermer', {
        duration: 3000
      });
    } finally {
      this.isLoading = false;
    }
  }
}
