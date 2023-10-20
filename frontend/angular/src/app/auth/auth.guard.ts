import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService)
  const router = inject(Router)

  return auth.isUserLoggedIn().pipe(
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
