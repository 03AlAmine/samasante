import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DoctorService } from '../../core/services/doctor.service';
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
  templateUrl: './doctors.html',
  styleUrls: ['./doctors.css']
})
export class DoctorsComponent implements OnInit {
  doctors: any[] = [];
  displayedColumns = ['name', 'specialty', 'email', 'phone', 'actions'];
  searchTerm = '';
  isLoading = false;

  constructor(
    private doctorService: DoctorService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.loadDoctors();
  }

  async loadDoctors() {
    this.isLoading = true;
    try {
      this.doctors = await this.doctorService.searchDoctors(this.searchTerm);
    } catch (error) {
      console.error('Error loading doctors:', error);
      this.showError('Erreur lors du chargement des médecins');
    } finally {
      this.isLoading = false;
    }
  }

  async searchDoctors(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    await this.loadDoctors();
  }

  async deleteDoctor(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce médecin ?'
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        try {
          await this.doctorService.deleteDoctor(id);
          this.doctors = this.doctors.filter(d => d.id !== id);
          this.showSuccess('Médecin supprimé avec succès');
        } catch (error) {
          this.showError('Erreur lors de la suppression du médecin');
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
