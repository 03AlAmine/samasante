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
import { ChartConfiguration, ChartData } from 'chart.js';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';

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
    BaseChartDirective,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule,
       CommonModule,
    RouterModule,
  ],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css']
})
export class OverviewComponent implements OnInit {
[x: string]: any;
  // Statistiques
  totalPatients = 0;
  totalDoctors = 0;
  todayAppointments = 0;
  upcomingAppointments = 0;
  occupancyRate = 0;
  newPatientsThisWeek = 0;
  newDoctorsThisWeek = 0;
  isLoading = true;

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
    private doctorService: DoctorService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    try {
      const user = await this.authService.getCurrentUser();
      if (!user) {
        this.showError('Utilisateur non connecté');
        return;
      }

      await this.loadStats(user.uid);
    } catch (error) {
      this.showError('Erreur lors du chargement du tableau de bord');
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadStats(doctorId: string) {
    try {
      this.isLoading = true;

      // Chargement parallèle des données principales
      const [patients, doctors, appointments, recentPatients, nextAppts] = await Promise.all([
        this.patientService.getPatients().catch(() => []),
        this.doctorService.getDoctors().catch(() => []),
        this.appointmentService.getAppointmentsBetweenDates(
          doctorId,
          this.getStartOfDay(),
          this.getEndOfDay()
        ).catch(() => []),
        this.patientService.getRecentPatients(5).catch(() => []),
        this.appointmentService.getUpcomingAppointments(doctorId, 5).catch(() => [])
      ]);

      // Chargement des données supplémentaires
      const [newPatientsThisWeek, newDoctorsThisWeek] = await Promise.all([
        this.patientService.getNewPatientsThisWeek().catch(() => []),
        this.doctorService.getNewDoctorsThisWeek().catch(() => [])
      ]);

      // Mise à jour des statistiques
      this.totalPatients = patients.length;
      this.totalDoctors = doctors.length;
      this.todayAppointments = appointments.length;
      this.upcomingAppointments = nextAppts.length;
      this.newPatientsThisWeek = newPatientsThisWeek.length;
      this.newDoctorsThisWeek = newDoctorsThisWeek.length;

      // Calcul du taux de remplissage
      const totalSlots = 20; // À adapter selon votre configuration
      this.occupancyRate = Math.round((this.todayAppointments / totalSlots) * 100);

      // Mise à jour des listes
      this.recentPatients = recentPatients;
      this.nextAppointments = nextAppts;
      this.newPatients = await this.patientService.getRecentPatients(3).catch(() => []);
      this.newDoctors = await this.doctorService.getDoctors(3).catch(() => []);

      // Mise à jour des graphiques
      await this.updateChartsData(doctorId);

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      this.showError('Erreur lors du chargement des données');
    } finally {
      this.isLoading = false;
    }
  }

  private async updateChartsData(doctorId: string) {
    try {
      // Données hebdomadaires pour le graphique à barres
      const weeklyAppointments = await this.getWeeklyAppointments(doctorId);
      this.appointmentsChartData.datasets[0].data = weeklyAppointments;

      // Données mensuelles pour le graphique linéaire
      const monthlyPatients = await this.getMonthlyPatients();
      this.patientsChartData.datasets[0].data = monthlyPatients;

    } catch (error) {
      console.error('Erreur lors de la mise à jour des graphiques:', error);
      // Valeurs par défaut en cas d'erreur
      this.appointmentsChartData.datasets[0].data = [0, 0, 0, 0, 0, 0, 0];
      this.patientsChartData.datasets[0].data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
  }

  private async getWeeklyAppointments(doctorId: string): Promise<number[]> {
    const days = [];
    const today = new Date();

    // Générer les 7 derniers jours
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }

    // Récupérer les rendez-vous pour chaque jour
    return Promise.all(
      days.map(async day => {
        const start = new Date(day);
        start.setHours(0, 0, 0, 0);

        const end = new Date(day);
        end.setHours(23, 59, 59, 999);

        const apps = await this.appointmentService.getAppointmentsBetweenDates(doctorId, start, end);
        return apps.length;
      })
    );
  }

  private async getMonthlyPatients(): Promise<number[]> {
    // Implémentation simplifiée - à adapter selon votre structure de données
    // Retourne un tableau de 12 éléments (un par mois)
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // Remplacez par votre logique
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

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
