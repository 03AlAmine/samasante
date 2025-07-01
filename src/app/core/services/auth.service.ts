import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  onAuthStateChanged
} from '@angular/fire/auth';

import { Router } from '@angular/router';

import {
  browserLocalPersistence
} from 'firebase/auth'; // ✅ CORRECT ici !

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private currentUser: any = null;

  constructor() {
    // Configurer la persistance
    setPersistence(this.auth, browserLocalPersistence)
      .catch((error) => {
        console.error('Error setting persistence:', error);
      });

    // Écouter les changements d'état d'authentification
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      if (user) {
        // Si l'utilisateur est connecté, rediriger vers le dashboard
        this.router.navigate(['/dashboard']);
      } else {
        // Si l'utilisateur est déconnecté, rediriger vers login
        this.router.navigate(['/login']);
      }
    });
  }

  async login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async register(email: string, password: string) {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }

  async logout() {
    await signOut(this.auth);
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }
}
