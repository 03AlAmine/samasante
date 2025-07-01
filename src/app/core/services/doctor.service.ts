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
  limit
} from '@angular/fire/firestore';
import { Doctor } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly doctorsCollection = 'doctors';

  constructor(private firestore: Firestore) {}

  async getDoctors(limitCount: number = 10): Promise<Doctor[]> {
    try {
      const q = query(
        collection(this.firestore, this.doctorsCollection),
        orderBy('lastName'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.mapDocToDoctor(doc));
    } catch (error) {
      console.error('Error getting doctors:', error);
      throw error;
    }
  }
  async addDoctor(doctor: Doctor): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.firestore, 'doctors'), {
        ...doctor,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding doctor:', error);
      throw error;
    }
  }

  async getNewDoctorsThisWeek(): Promise<Doctor[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const q = query(
      collection(this.firestore, this.doctorsCollection),
      where('createdAt', '>=', oneWeekAgo),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => this.mapDocToDoctor(doc));
  }

  async searchDoctors(term: string = ''): Promise<Doctor[]> {
    try {
      let q = query(
        collection(this.firestore, this.doctorsCollection),
        orderBy('lastName')
      );

      const snapshot = await getDocs(q);
      const doctors = snapshot.docs.map(doc => this.mapDocToDoctor(doc));

      if (!term.trim()) {
        return doctors;
      }

      const searchTerm = term.toLowerCase().trim();
      return doctors.filter(doctor =>
        doctor.lastName?.toLowerCase().includes(searchTerm) ||
        doctor.firstName?.toLowerCase().includes(searchTerm) ||
        doctor.specialty?.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching doctors:', error);
      throw error;
    }
  }

  async createDoctor(doctorData: Partial<Doctor>): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.firestore, this.doctorsCollection), {
        ...doctorData,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating doctor:', error);
      throw error;
    }
  }

  async deleteDoctor(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.doctorsCollection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting doctor:', error);
      throw error;
    }
  }

  private mapDocToDoctor(doc: any): Doctor {
    const data = doc.data();
    return {
      id: doc.id,
      lastName: data.lastName,
      firstName: data.firstName,
      specialty: data.specialty,
      email: data.email,
      phone: data.phone,
      createdAt: data.createdAt?.toDate()
    };
  }
}
