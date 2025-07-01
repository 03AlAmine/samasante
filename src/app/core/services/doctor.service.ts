import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from '@angular/fire/firestore';
import { Doctor } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  getNewDoctorsThisWeek() {
    throw new Error('Method not implemented.');
  }
  getDoctors(arg0: number): any {
    throw new Error('Method not implemented.');
  }
  constructor(private firestore: Firestore) {}

  async addDoctor(doctor: Doctor) {
    const docRef = await addDoc(collection(this.firestore, 'doctors'), {
      ...doctor,
      createdAt: new Date()
    });
    return docRef.id;
  }

  async searchDoctors(term: string) {
    const q = query(collection(this.firestore, 'doctors'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async deleteDoctor(id: string) {
    await deleteDoc(doc(this.firestore, `doctors/${id}`));
  }
}
