export interface Patient {
  id?: string;
  lastName: string;
  firstName: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: string;
  email: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  medicalHistory?: string;
  allergies?: string[];
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  createdAt?: string;
  updatedAt?: string;
}
