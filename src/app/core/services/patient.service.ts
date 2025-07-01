import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  runTransaction
} from '@angular/fire/firestore';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly patientsCollection = 'patients';

  constructor(private firestore: Firestore) {}

  async getPatients(limitCount: number = 10): Promise<Patient[]> {
    try {
      const q = query(
        collection(this.firestore, this.patientsCollection),
        orderBy('lastName'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.mapDocToPatient(doc));
    } catch (error) {
      console.error('Error getting patients:', error);
      throw error;
    }
  }

  async searchPatients(searchTerm: string = ''): Promise<Patient[]> {
    try {
      let q = query(
        collection(this.firestore, this.patientsCollection),
        orderBy('lastName')
      );

      const snapshot = await getDocs(q);
      const patients = snapshot.docs.map(doc => this.mapDocToPatient(doc));

      if (!searchTerm.trim()) {
        return patients;
      }

      const term = searchTerm.toLowerCase().trim();
      return patients.filter(patient =>
        patient.lastName?.toLowerCase().includes(term) ||
        patient.firstName?.toLowerCase().includes(term) ||
        patient.email?.toLowerCase().includes(term) ||
        patient.phone?.includes(term)
      );
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }

  async getPatientById(id: string): Promise<Patient | null> {
    try {
      const docRef = doc(this.firestore, this.patientsCollection, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return this.mapDocToPatient(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error getting patient:', error);
      throw error;
    }
  }

  async getNewPatientsThisWeek(): Promise<Patient[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const q = query(
      collection(this.firestore, this.patientsCollection),
      where('createdAt', '>=', oneWeekAgo),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => this.mapDocToPatient(doc));
  }

  async getRecentPatients(limitCount: number = 5): Promise<Patient[]> {
    const q = query(
      collection(this.firestore, this.patientsCollection),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => this.mapDocToPatient(doc));
  }

  async createPatient(patientData: Partial<Patient>): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.firestore, this.patientsCollection), {
        ...patientData,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async updatePatient(id: string, patientData: Partial<Patient>): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.patientsCollection, id);
      await updateDoc(docRef, {
        ...patientData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  async deletePatient(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.patientsCollection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  private mapDocToPatient(doc: any): Patient {
    const data = doc.data();
    return {
      id: doc.id,
      lastName: data.lastName,
      firstName: data.firstName,
      email: data.email,
      phone: data.phone,
      birthDate: data.birthDate?.toDate(),
      createdAt: data.createdAt?.toDate()
    };
  }
}
