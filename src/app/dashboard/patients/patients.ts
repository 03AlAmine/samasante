import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PatientService } from '../../core/services/patient.service';
import { RouterLink } from '@angular/router';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatInputModule,
    RouterLink,
    MatProgressSpinnerModule
  ],
  templateUrl: './patients.html',
  styleUrls: ['./patients.css']
})
export class PatientsComponent implements OnInit {
  patients: any[] = [];
  displayedColumns = ['name', 'email', 'phone', 'actions'];
  searchTerm = '';
  isLoading = false;

  constructor(
    private patientService: PatientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.loadPatients();
  }

// Dans patients.component.ts
async loadPatients() {
  this.isLoading = true;
  try {
    this.patients = await this.patientService.searchPatients(this.searchTerm);
  } catch (error) {
    console.error('Error loading patients:', error);
    this.showError('Erreur lors du chargement des patients');
  } finally {
    this.isLoading = false;
  }
}

  async searchPatients(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    await this.loadPatients();
  }

  async deletePatient(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce patient ?'
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          await this.patientService.deletePatient(id);
          this.patients = this.patients.filter(p => p.id !== id);
          this.showSuccess('Patient supprimé avec succès');
        } catch (error) {
          this.showError('Erreur lors de la suppression du patient');
        }
      }
    });
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
