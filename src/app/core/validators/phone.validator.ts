// phone.validator.ts
import { AbstractControl, ValidatorFn } from '@angular/forms';

export function PhoneNumberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) return null;

    // Format international simple
    const regex = /^\+?[0-9\s\-()]{10,15}$/;
    const valid = regex.test(value);
    return valid ? null : { invalidPhone: { value: control.value } };
  };
}
