import { Injectable } from '@angular/core';
import {
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
  getCountFromServer
} from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { runTransaction as firestoreRunTransaction } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  getNewPatientsThisWeek() {
    throw new Error('Method not implemented.');
  }
  private readonly patientsCollection = 'patients';
  async getPatients(p0: number): Promise<any[]> {
    try {
      const patientsCol = collection(this.firestore, this.patientsCollection);
      const snapshot = await getDocs(query(patientsCol, orderBy('lastName')));
      return snapshot.docs.map(doc => ({
        id: doc.id, // Utilise l'ID de document Firestore
        ...doc.data() as {
          lastName: string;
          firstName: string;
          email: string;
          phone: string;
          birthDate?: Date;
        }
      }));
    } catch (error) {
      console.error('Error getting patients:', error);
      throw error;
    }
  }
  constructor(private firestore: Firestore) {}

  async searchPatients(searchTerm: string = ''): Promise<any[]> {
    try {
      const patientsCol = collection(this.firestore, this.patientsCollection);
      let q = query(patientsCol, orderBy('lastName')); // Trie par nom par défaut

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id, // Utilise l'ID de document Firestore
        ...doc.data() as {
          lastName: string;
          firstName: string;
          email: string;
          phone: string;
          birthDate?: Date;
        }
      })).filter(patient => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase().trim();
        return (
          patient.lastName?.toLowerCase().includes(term) ||
          patient.firstName?.toLowerCase().includes(term) ||
          patient.email?.toLowerCase().includes(term) ||
          patient.phone?.includes(term)
        );
      });
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }

  async getPatientById(id: string): Promise<any> {
    try {
      const patientDoc = doc(this.firestore, this.patientsCollection, id);
      const snapshot = await getDocs(query(collection(this.firestore, this.patientsCollection),
                                  where('__name__', '==', id)));

      if (snapshot.empty) {
        throw new Error('Patient not found');
      }

      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      };
    } catch (error) {
      console.error('Error getting patient:', error);
      throw error;
    }
  }

  async createPatient(patientData: any): Promise<string> {
    try {
      // Générer un ID séquentiel
      const newId = await this.getNextSequentialId();
      patientData.patientId = newId; // Stocke l'ID séquentiel

      const patientsCol = collection(this.firestore, this.patientsCollection);
      const docRef = await addDoc(patientsCol, patientData);

      return docRef.id; // Retourne l'ID Firestore
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async updatePatient(id: string, patientData: any): Promise<void> {
    try {
      const patientDoc = doc(this.firestore, this.patientsCollection, id);
      await updateDoc(patientDoc, patientData);
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  async deletePatient(id: string): Promise<void> {
    try {
      const patientDoc = doc(this.firestore, this.patientsCollection, id);
      await deleteDoc(patientDoc);
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  private async getNextSequentialId(): Promise<number> {
    try {
      const counterCol = collection(this.firestore, 'counters');
      const counterDoc = doc(counterCol, this.patientsCollection);

      // Utilisation d'une transaction pour éviter les conflits
      const newId = await runTransaction(this.firestore, async (transaction) => {
        const sfDoc = await transaction.get(counterDoc);

        if (!sfDoc.exists()) {
          transaction.set(counterDoc, { lastId: 1 });
          return 1;
        }

        const newId = sfDoc.data()['lastId'] + 1;
        transaction.update(counterDoc, { lastId: newId });
        return newId;
      });

      return newId;
    } catch (error) {
      console.error('Error generating sequential ID:', error);
      // Fallback: utiliser un timestamp si la transaction échoue
      return new Date().getTime();
    }
  }
  async getRecentPatients(limitCount: number): Promise<any[]> {
  const q = query(
    collection(this.firestore, 'patients'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
}


function runTransaction(firestore: Firestore, updateFunction: (transaction: any) => Promise<any>) {
  // Delegate to AngularFire's runTransaction, which provides the transaction object
  return firestoreRunTransaction(firestore, updateFunction);
}


