// src/app/dashboard/appointments/appointments.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';
import { CalendarComponent } from './calendar/calendar';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
  ],
  template: `
    <div class="header">
      <h2>Gestion des Rendez-vous</h2>
      <div>
        <button mat-raised-button color="primary" (click)="showCalendar()">
          <mat-icon>calendar_today</mat-icon> Voir calendrier
        </button>
      </div>
    </div>

    <table mat-table [dataSource]="appointments" class="mat-elevation-z8">
      <!-- Date Column -->
      <ng-container matColumnDef="date">
        <th mat-header-cell *matHeaderCellDef>Date</th>
        <td mat-cell *matCellDef="let appt">
          {{ appt.date | date:'medium' }}
        </td>
      </ng-container>

      <!-- Patient Column -->
      <ng-container matColumnDef="patient">
        <th mat-header-cell *matHeaderCellDef>Patient</th>
        <td mat-cell *matCellDef="let appt">
          {{ appt.patientName || 'N/A' }}
        </td>
      </ng-container>

      <!-- Reason Column -->
      <ng-container matColumnDef="reason">
        <th mat-header-cell *matHeaderCellDef>Motif</th>
        <td mat-cell *matCellDef="let appt">{{ appt.reason }}</td>
      </ng-container>

      <!-- Actions Column -->
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let appt">
          <button mat-icon-button color="warn" (click)="cancelAppointment(appt.id)">
            <mat-icon>cancel</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
    }
  `]
})
export class AppointmentsComponent implements OnInit {
  appointments: any[] = [];
  displayedColumns = ['date', 'patient', 'reason', 'actions'];

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private dialog: MatDialog

  ) {}

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.appointments = await this.appointmentService.getAppointmentsByDoctor(user.uid);
    }
  }

  async cancelAppointment(id: string) {
    await this.appointmentService.cancelAppointment(id);
    this.appointments = this.appointments.filter(a => a.id !== id);
  }
    showCalendar() {
    this.dialog.open(CalendarComponent, {
      width: '95%',
      height: '90vh'
    });
  }
}
