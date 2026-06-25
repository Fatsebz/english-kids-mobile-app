import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProfileService } from './profile.service';

/** Redirige vers `/profiles` tant qu'aucun profil n'est sélectionné. */
export const profileGuard: CanActivateFn = () => {
  const profiles = inject(ProfileService);
  const router = inject(Router);
  return profiles.current() ? true : router.parseUrl('/profiles');
};
