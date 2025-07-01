// src/app/dashboard/appointments/calendar/calendar.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentFormComponent } from '../appointment-form';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  template: `
    <div class="calendar-container">
      <full-calendar [options]="calendarOptions"></full-calendar>
    </div>
  `,
  styles: [`
    .calendar-container {
      padding: 20px;
    }
    ::ng-deep .fc-event {
      cursor: pointer;
    }
  `]
})
export class CalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    weekends: false,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    events: [],
    eventClick: this.handleEventClick.bind(this),
    dateClick: this.handleDateClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this)
  };

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private patientService: PatientService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    await this.loadAppointments();
  }

  async loadAppointments() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const appointments = await this.appointmentService.getAppointmentsByDoctor(user.uid);
    const events = await Promise.all(appointments.map(async (a: any) => {
      const patient = await this.patientService.getPatientById(a.patientId);
      return {
        id: a.id,
        title: patient ? `${patient['lastName']} ${patient['firstName']}` : 'Patient inconnu',
        start: a.date.toISOString(),
        extendedProps: {
          reason: a.reason,
          status: a.status,
          patientId: a.patientId
        }
      };
    }));

    this.calendarOptions.events = events;
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.dialog.open(AppointmentFormComponent, {
      width: '500px',
      data: {
        appointmentId: clickInfo.event.id,
        mode: 'edit'
      }
    });
  }

  handleDateClick(arg: any) {
    this.dialog.open(AppointmentFormComponent, {
      width: '500px',
      data: {
        date: arg.date,
        mode: 'create'
      }
    });
  }

  async handleEventDrop(dropInfo: any) {
    await this.appointmentService.updateAppointment(dropInfo.event.id, {
      date: dropInfo.event.start
    });
  }

  async handleEventResize(resizeInfo: any) {
    await this.appointmentService.updateAppointment(resizeInfo.event.id, {
      endDate: resizeInfo.event.end
    });
  }
}
