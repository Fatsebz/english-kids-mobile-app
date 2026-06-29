import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Profile, ProfileService } from '../../core/profile.service';
import { ProfileEditor, ProfileDraft } from '../../shared/profile-editor/profile-editor';

@Component({
  selector: 'app-profiles',
  imports: [ProfileEditor],
  template: `
    <main class="picker">
      <img class="logo" src="englishkidz.webp" alt="English Kidz" />
      <h1 class="title big">Qui joue&nbsp;?</h1>

      <div class="avatars">
        @for (p of profiles(); track p.id) {
          <button class="avatar anim-pop" (click)="choose(p)">
            <img [src]="p.img" [alt]="p.name" />
            <span class="who">{{ p.name }}</span>
          </button>
        }
        @if (canAdd()) {
          <button class="avatar add anim-pop" (click)="creating.set(true)" aria-label="Nouveau profil">
            <span class="plus">＋</span>
            <span class="who">Nouveau</span>
          </button>
        }
      </div>

      <button class="admin anim-pop" (click)="openAdmin()" aria-label="Réglages">
        <span class="gear">⚙️</span>
        <span class="who small">Réglages</span>
      </button>
    </main>

    @if (creating()) {
      <app-profile-editor (save)="create($event)" (cancel)="creating.set(false)" />
    }
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
      .logo {
        width: clamp(150px, 50vw, 240px);
        height: auto;
        filter: drop-shadow(0 6px 16px var(--c-shadow));
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
      .avatar.add .plus {
        width: clamp(130px, 38vw, 180px);
        height: clamp(130px, 38vw, 180px);
        border-radius: 50%;
        border: 6px dashed rgba(255, 255, 255, 0.85);
        background: rgba(255, 255, 255, 0.18);
        display: grid;
        place-items: center;
        font-size: 4rem;
        color: #fff;
        line-height: 1;
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
  readonly creating = signal(false);

  /** Bouton « Nouveau » seulement si aucun profil n'existe (ensuite : ajout via les Réglages). */
  canAdd(): boolean {
    return this.profiles().length === 0;
  }

  choose(p: Profile): void {
    this.profileSvc.select(p.id);
    this.router.navigateByUrl('/');
  }

  create(draft: ProfileDraft): void {
    const created = this.profileSvc.addProfile(draft.name, draft.img, draft.canRead);
    this.creating.set(false);
    if (created) {
      this.profileSvc.select(created.id);
      this.router.navigateByUrl('/');
    }
  }

  openAdmin(): void {
    this.router.navigateByUrl('/admin');
  }
}
