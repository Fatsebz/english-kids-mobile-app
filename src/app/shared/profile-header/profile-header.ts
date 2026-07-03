import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { ProfileService } from '../../core/profile.service';
import { UkFlag } from '../uk-flag/uk-flag';

/**
 * Bandeau permanent en haut : avatar + prénom du profil courant.
 * Tap → écran de sélection (changer de profil). Masqué sur `/profiles` ou sans profil.
 */
@Component({
  selector: 'app-profile-header',
  imports: [UkFlag],
  template: `
    @if (profile() && !onPicker()) {
      <header class="profile-header" (click)="switch()">
        <img [src]="profile()!.img" [alt]="profile()!.name" />
        <span class="name">{{ profile()!.name }}</span>
        <app-uk-flag class="flag" />
      </header>
    }
  `,
  styles: [
    `
      .profile-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 40;
        height: 56px;
        padding: 0 14px;
        padding-top: env(safe-area-inset-top);
        height: calc(56px + env(safe-area-inset-top));
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(43, 45, 66, 0.32);
        backdrop-filter: blur(6px);
        cursor: pointer;
      }
      .profile-header img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #fff;
      }
      .name {
        font-weight: 700;
        color: #fff;
        font-size: 1.1rem;
      }
      .flag {
        position: absolute;
        left: 50%;
        /* Centré dans la zone de CONTENU (56px sous le safe-area), comme l'avatar/prénom.
           Sans le safe-area, 'top: 50%' remontait le drapeau au-dessus de la ligne sur mobile. */
        top: calc(env(safe-area-inset-top) + 28px);
        transform: translate(-50%, -50%);
        width: 46px;
        aspect-ratio: 2 / 1;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
      }
    `,
  ],
})
export class ProfileHeader {
  private readonly profileSvc = inject(ProfileService);
  private readonly router = inject(Router);

  readonly profile = this.profileSvc.current;

  /** Vrai quand on est sur l'écran de sélection de profil. */
  readonly onPicker = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url.startsWith('/profiles')),
      startWith(this.router.url.startsWith('/profiles')),
    ),
    { initialValue: this.router.url.startsWith('/profiles') },
  );

  switch(): void {
    this.router.navigateByUrl('/profiles');
  }
}
