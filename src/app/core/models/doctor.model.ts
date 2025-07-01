export interface Doctor {
  id?: string; // Optionnel car généré par Firestore
  firstName: string;
  lastName: string;
  specialty: string;
  email: string;
  phone: string;
  createdAt?: Date;
}
