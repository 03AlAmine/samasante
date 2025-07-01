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
  imports: [CommonModule, MatButtonModule, MatTableModule, MatIconModule],
  templateUrl: './appointments.html',
  styleUrls: ['./appointments.css'],
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
      this.appointments = await this.appointmentService.getAppointmentsByDoctor(
        user.uid
      );
    }
  }

  async cancelAppointment(id: string) {
    await this.appointmentService.cancelAppointment(id);
    this.appointments = this.appointments.filter((a) => a.id !== id);
  }

  showCalendar() {
    this.dialog.open(CalendarComponent, {
      width: '95%',
      height: '90vh',
    });
  }
}
