// birthdate.validator.ts
import { AbstractControl, ValidatorFn } from '@angular/forms';

export function BirthDateValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) return null;

    const birthDate = new Date(value);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 120); // 120 ans max

    if (birthDate > today) {
      return { futureDate: true };
    }

    if (birthDate < minDate) {
      return { tooOld: true };
    }

    return null;
  };
}
