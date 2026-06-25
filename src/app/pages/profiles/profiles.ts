import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Profile, ProfileService } from '../../core/profile.service';
import { UkFlag } from '../../shared/uk-flag/uk-flag';

@Component({
  selector: 'app-profiles',
  imports: [UkFlag],
  template: `
    <main class="picker">
      <app-uk-flag class="flag" />
      <h1 class="title big">Qui joue&nbsp;?</h1>

      <div class="avatars">
        @for (p of profiles; track p.id) {
          <button class="avatar anim-pop" (click)="choose(p)">
            <img [src]="p.img" [alt]="p.name" />
            <span class="who">{{ p.name }}</span>
          </button>
        }
      </div>

      <button class="admin anim-pop" (click)="openAdmin()" aria-label="Réglages">
        <span class="gear">⚙️</span>
        <span class="who small">Réglages</span>
      </button>
    </main>
  `,
  styles: [
    `
      .picker {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 28px;
        min-height: 100dvh;
        padding: 24px calc(24px + env(safe-area-inset-left)) calc(24px + env(safe-area-inset-bottom));
      }
      .flag {
        width: clamp(90px, 30vw, 130px);
        aspect-ratio: 2 / 1;
        box-shadow: 0 6px 16px var(--c-shadow);
        border-radius: 6px;
      }
      .big {
        font-size: clamp(2rem, 9vw, 3rem);
      }
      .avatars {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 24px;
      }
      .avatar {
        border: none;
        background: transparent;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        font-family: inherit;
        transition: transform 0.1s ease;
      }
      .avatar:active {
        transform: scale(0.94);
      }
      .avatar img {
        width: clamp(130px, 38vw, 180px);
        height: clamp(130px, 38vw, 180px);
        border-radius: 50%;
        object-fit: cover;
        border: 6px solid #fff;
        box-shadow: 0 10px 24px var(--c-shadow);
      }
      .who {
        font-size: 1.8rem;
        font-weight: 700;
        color: #fff;
        text-shadow: 0 3px 0 var(--c-shadow);
      }
      .admin {
        border: none;
        background: rgba(255, 255, 255, 0.18);
        border-radius: 24px;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        font-family: inherit;
      }
      .admin:active {
        transform: scale(0.96);
      }
      .gear {
        font-size: 1.8rem;
      }
      .who.small {
        font-size: 1.1rem;
      }
    `,
  ],
})
export class Profiles {
  private readonly profileSvc = inject(ProfileService);
  private readonly router = inject(Router);

  readonly profiles = this.profileSvc.profiles;

  choose(p: Profile): void {
    this.profileSvc.select(p.id);
    this.router.navigateByUrl('/');
  }

  openAdmin(): void {
    this.router.navigateByUrl('/admin');
  }
}
