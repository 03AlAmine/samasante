// src/app/dashboard/appointments/appointment-form.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { PatientService } from '../../core/services/patient.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'create' ? 'Nouveau Rendez-vous' : 'Modifier Rendez-vous' }}
    </h2>

    <mat-dialog-content>
      <mat-form-field>
        <mat-label>Patient</mat-label>
        <select matNativeControl [(ngModel)]="appointment.patientId" name="patient" required>
          <option *ngFor="let patient of patients" [value]="patient.id">
            {{ patient.lastName }} {{ patient.firstName }}
          </option>
        </select>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Date</mat-label>
        <input matInput [(ngModel)]="appointment.date" type="datetime-local" name="date" required>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Motif</mat-label>
        <textarea matInput [(ngModel)]="appointment.reason" name="reason" required></textarea>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-button (click)="cancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="save()">
        {{ data.mode === 'create' ? 'Créer' : 'Mettre à jour' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
      margin-bottom: 15px;
    }
  `]
})
export class AppointmentFormComponent implements OnInit {
  appointment: any = {
    patientId: '',
    date: '',
    reason: ''
  };
  patients: any[] = [];

  constructor(
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<AppointmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    this.patients = await this.patientService.searchPatients('');

    if (this.data.mode === 'edit') {
      // Since getAppointmentById does not exist, use getAppointmentsByDoctor and filter by ID
      const user = this.authService.getCurrentUser();
      if (!user || !user.uid) {
        throw new Error('Utilisateur non authentifié ou UID manquant');
      }
      const allAppointments = await this.appointmentService.getAppointmentsByDoctor(user.uid);
      const appointment = allAppointments.find((a: any) => a.id === this.data.appointmentId);
      if (appointment) {
        this.appointment = {
          ...appointment,
          date: this.formatDateForInput(appointment.date)
        };
      }
    } else if (this.data.date) {
      this.appointment.date = this.formatDateForInput(this.data.date);
    }
  }

  private formatDateForInput(date: Date): string {
    return new Date(date).toISOString().slice(0, 16);
  }

  async save() {
    const appointmentData = {
      ...this.appointment,
      date: new Date(this.appointment.date)
    };

    if (this.data.mode === 'create') {
      const user = this.authService.getCurrentUser();
      await this.appointmentService.createAppointment({
        ...appointmentData,
        doctorId: user?.uid,
        status: 'planned'
      });
    } else {
      await this.appointmentService.updateAppointment(
        this.data.appointmentId,
        appointmentData
      );
    }

    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
