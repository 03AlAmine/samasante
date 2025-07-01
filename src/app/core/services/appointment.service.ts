// src/app/core/services/appointment.service.ts
import { Injectable } from '@angular/core';
import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  query, where, orderBy, Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { serverTimestamp as firestoreServerTimestamp } from 'firebase/firestore';

// Define the Appointment interface if not already defined or import it from its module
export interface Appointment {
  patientId: string;
  doctorId: string;
  date: Date | Timestamp;
  reason: string;
  status?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly appointmentsCol = collection(db, 'appointments');

  async getAppointmentsByDoctor(doctorId: string) {
    const q = query(
      this.appointmentsCol,
      where('doctorId', '==', doctorId),
      orderBy('date', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      date: d.data()['date']?.toDate()
    }));
  }

  async createAppointment(appointmentData: any) {
    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        ...appointmentData,
        status: 'planned',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log("RDV créé avec ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Erreur création RDV:", error);
      throw error;
    }
  }

  async cancelAppointment(id: string) {
    await updateDoc(doc(db, 'appointments', id), {
      status: 'cancelled'
    });
  }

  async updateAppointment(id: string, data: Partial<Appointment>) {
    await updateDoc(doc(db, 'appointments', id), data);
  }

  async getAppointmentsBetweenDates(doctorId: string, start: Date, end: Date) {
    const q = query(
      this.appointmentsCol,
      where('doctorId', '==', doctorId),
      where('date', '>=', Timestamp.fromDate(start)),
      where('date', '<=', Timestamp.fromDate(end))
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      date: d.data()['date']?.toDate()
    }));
  }
  async getUpcomingAppointments(doctorId: string, daysAhead: number): Promise<any[]> {
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(now.getDate() + daysAhead);

  const q = query(
    this.appointmentsCol,
    where('doctorId', '==', doctorId),
    where('date', '>=', now),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data['date']?.toDate(),
      patientName: data['patientName'] || 'Patient inconnu'
    };
  });
}
}

function serverTimestamp() {
  return firestoreServerTimestamp();
}

