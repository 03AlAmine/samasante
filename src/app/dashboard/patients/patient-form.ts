import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PatientService } from '../../core/services/patient.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
        MatProgressSpinnerModule

  ],
  templateUrl: './patient-form.html',
  styleUrls: ['./patient-form.css']
})
export class PatientFormComponent implements OnInit {
  patientForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  maxDate: Date;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.maxDate = new Date();
    this.patientForm = this.fb.group({
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-()]+$/)]],
      birthDate: [null]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadPatient(id);
    }
  }

async loadPatient(id: string) {
  this.isLoading = true;
  try {
    const patient = await this.patientService.getPatientById(id);
    if (patient) {
      this.patientForm.patchValue({
        id: patient.id,
        lastName: patient.lastName,
        firstName: patient.firstName,
        email: patient.email,
        phone: patient.phone,
          birthDate: patient.birthDate ? new Date(patient.birthDate) : null
        });
      }
    } catch (error) {
      this.showError('Erreur lors du chargement du patient');
      this.router.navigate(['/dashboard/patients']);
    } finally {
      this.isLoading = false;
    }
  }

  async handleSubmit() {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    try {
      const patientData = this.patientForm.value;

      if (this.isEditMode) {
        await this.patientService.updatePatient(patientData.id, patientData);
        this.showSuccess('Patient mis à jour avec succès');
      } else {
        await this.patientService.createPatient(patientData);
        this.showSuccess('Patient créé avec succès');
      }

      this.router.navigate(['/dashboard/patients']);
    } catch (error) {
      this.showError(`Erreur lors de ${this.isEditMode ? 'la mise à jour' : 'la création'} du patient`);
    } finally {
      this.isLoading = false;
    }
  }

  cancel() {
    this.router.navigate(['/dashboard/patients']);
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}
