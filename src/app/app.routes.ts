import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { DashboardComponent } from './dashboard/dashboard';
import { PatientsComponent } from './dashboard/patients/patients';
import { AppointmentsComponent } from './dashboard/appointments/appointments';
import { PatientFormComponent } from './dashboard/patients/patient-form';
import { OverviewComponent } from './dashboard/overview/overview';
import { AppointmentFormComponent } from './dashboard/appointments/appointment-form';
import { DoctorsComponent } from './dashboard/doctor/doctors';
import { DoctorFormComponent } from './dashboard/doctor/doctor-form';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Connexion'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Inscription'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    title: 'Tableau de bord',
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        component: OverviewComponent,
        title: 'Vue d\'ensemble'
      },
      {
        path: 'patients',
        title: 'Patients',
        children: [
          {
            path: '',
            component: PatientsComponent,
            title: 'Liste des patients'
          },
          {
            path: 'new',
            component: PatientFormComponent,
            title: 'Nouveau patient'
          },
          {
            path: 'edit/:id',
            component: PatientFormComponent,
            title: 'Modifier patient'
          }
        ]
      },
      {
      path: 'doctors',
      title: 'Médecins',
      children: [
        {
          path: '',
          component: DoctorsComponent,  // Nous allons créer ce composant
          title: 'Liste des médecins',
        },
        {
          path: 'new',
          component: DoctorFormComponent,
          title: 'Nouveau médecin',
        },
        {
          path: 'edit/:id',
          component: DoctorFormComponent,
          title: 'Modifier médecin',
        }
      ]
    },
      {
        path: 'appointments',
        title: 'Rendez-vous',
        children: [
          {
            path: '',
            component: AppointmentsComponent,
            title: 'Liste des rendez-vous'
          },
          {
            path: 'new',
            component: AppointmentFormComponent,
            title: 'Nouveau rendez-vous'
          },
          {
            path: 'edit/:id',
            component: AppointmentFormComponent,
            title: 'Modifier rendez-vous'
          }
        ]
      }
    ]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login',
    title: 'Page non trouvée'
  }
];
