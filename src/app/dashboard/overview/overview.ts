import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PatientService } from '../../core/services/patient.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import { DoctorService } from '../../core/services/doctor.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    BaseChartDirective
  ],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css']
})
export class OverviewComponent implements OnInit {
  // Statistiques
  totalPatients = 0;
  totalDoctors = 0;
  todayAppointments = 0;
  upcomingAppointments = 0;
  occupancyRate = 0;
  newPatientsThisWeek = 0;
  newDoctorsThisWeek = 0;

  // Listes
  recentPatients: any[] = [];
  nextAppointments: any[] = [];
  newPatients: any[] = [];
  newDoctors: any[] = [];

  // Graphiques
  appointmentsChartData: ChartData<'bar'> = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        label: 'Rendez-vous',
        backgroundColor: '#4361ee',
        hoverBackgroundColor: '#3a56d4'
      }
    ]
  };

  patientsChartData: ChartData<'line'> = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        label: 'Nouveaux patients',
        borderColor: '#2ec4b6',
        backgroundColor: 'rgba(46, 196, 182, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 12,
        cornerRadius: 4
      }
    }
  };

  constructor(
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private doctorService: DoctorService
  ) {}

  async ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    await this.loadStats(user.uid);
  }

  async loadStats(doctorId: string) {
    try {
      // Chargement parallèle des données
      const [patients, doctors, appointments, recentPatients, nextAppointments] = await Promise.all([
        this.patientService.getPatients(0),
        this.doctorService.getDoctors(0),
        this.appointmentService.getAppointmentsBetweenDates(doctorId, this.getStartOfDay(), this.getEndOfDay()),
        this.patientService.getRecentPatients(5),
        this.appointmentService.getUpcomingAppointments(doctorId, 5)
      ]);

      // Statistiques
      this.totalPatients = patients.length;
      this.totalDoctors = doctors.length;
      this.todayAppointments = appointments.length;
      this.upcomingAppointments = (await this.appointmentService.getUpcomingAppointments(doctorId, 7)).length;
      const newPatientsThisWeek = await this.patientService.getNewPatientsThisWeek();
      this.newPatientsThisWeek = Array.isArray(newPatientsThisWeek) ? newPatientsThisWeek.length : 0;
      const newDoctorsThisWeek = await this.doctorService.getNewDoctorsThisWeek();
      this.newDoctorsThisWeek = Array.isArray(newDoctorsThisWeek) ? newDoctorsThisWeek.length : 0;

      // Taux de remplissage
      const totalSlots = 20;
      this.occupancyRate = Math.round((this.todayAppointments / totalSlots) * 100);

      // Listes
      this.recentPatients = recentPatients;
      this.nextAppointments = nextAppointments;
      this.newPatients = await this.patientService.getPatients(3);
      this.newDoctors = await this.doctorService.getDoctors(3);

      // Données des graphiques (simulées)
      this.appointmentsChartData.datasets[0].data = [5, 7, 3, 8, 4, 1, 0];
      this.patientsChartData.datasets[0].data = [12, 15, 8, 10, 18, 22, 25, 20, 28, 30, 27, 35];

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  }

  private getStartOfDay(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private getEndOfDay(): Date {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  }
}
