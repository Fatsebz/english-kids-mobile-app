import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { AVATARS, Profile, ProfileService } from '../../core/profile.service';

/** Données saisies pour créer ou modifier un profil. */
export interface ProfileDraft {
  name: string;
  img: string;
  canRead: boolean;
}

/**
 * Overlay de création / modification d'un profil : prénom (≤ 20) + choix d'avatar.
 * `profile` = null → création ; sinon édition pré-remplie. Émet `save` (validé) ou `cancel`.
 * Réutilisé par l'écran de sélection et par les Réglages.
 */
@Component({
  selector: 'app-profile-editor',
  template: `
    <div class="overlay" (click)="cancel.emit()">
      <div class="dialog anim-pop" (click)="$event.stopPropagation()">
        <h2 class="dlg-title">{{ profile() ? 'Modifier le profil' : 'Nouveau profil' }}</h2>

        <input
          #nameInput
          class="name-input"
          type="text"
          [attr.maxlength]="nameMax"
          [value]="name()"
          (input)="name.set(nameInput.value)"
          placeholder="Prénom"
          autocomplete="off"
          autocapitalize="words"
        />

        <p class="hint">Choisis un avatar</p>
        <div class="avatars">
          @for (a of avatars; track a.key) {
            <button type="button" class="avatar" [class.sel]="img() === a.img" (click)="img.set(a.img)">
              <img [src]="a.img" [alt]="a.key" />
            </button>
          }
        </div>

        <label class="read-toggle">
          <input type="checkbox" [checked]="canRead()" (change)="canRead.set($any($event.target).checked)" />
          <span>📖 Je sais lire</span>
        </label>
        <p class="read-hint">
          Décoche pour un non-lecteur : les thèmes « texte » (l'heure, les jours, les mois…) seront masqués.
        </p>

        <div class="actions">
          <button class="btn btn--ghost" (click)="cancel.emit()">Annuler</button>
          <button class="btn btn--green" [disabled]="!canSave()" (click)="submit()">Valider</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        z-index: 55;
        display: grid;
        place-items: center;
        background: rgba(43, 45, 66, 0.45);
        padding: 20px;
      }
      .dialog {
        width: min(420px, 100%);
        background: var(--c-card);
        color: var(--c-text);
        border-radius: var(--radius);
        box-shadow: 0 16px 40px var(--c-shadow);
        padding: 22px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .dlg-title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        text-align: center;
      }
      .name-input {
        font-family: inherit;
        font-size: 1.3rem;
        text-align: center;
        padding: 14px;
        border: 2px solid #ddd;
        border-radius: 16px;
        width: 100%;
      }
      .name-input:focus {
        outline: none;
        border-color: var(--c-blue);
      }
      .hint {
        margin: 2px 0 0;
        text-align: center;
        font-weight: 600;
        opacity: 0.7;
      }
      .avatars {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 16px;
      }
      .avatar {
        border: none;
        background: transparent;
        padding: 0;
        cursor: pointer;
        border-radius: 50%;
        transition: transform 0.1s ease;
      }
      .avatar:active {
        transform: scale(0.94);
      }
      .avatar img {
        width: clamp(84px, 26vw, 110px);
        height: clamp(84px, 26vw, 110px);
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid transparent;
        box-shadow: 0 6px 16px var(--c-shadow);
      }
      .avatar.sel img {
        border-color: var(--c-green);
      }
      .read-toggle {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 1.15rem;
        font-weight: 600;
        cursor: pointer;
        margin-top: 4px;
      }
      .read-toggle input[type='checkbox'] {
        width: 28px;
        height: 28px;
        flex: 0 0 auto;
      }
      .read-hint {
        margin: -6px 0 0;
        font-size: 0.9rem;
        opacity: 0.65;
      }
      .actions {
        display: flex;
        gap: 12px;
        margin-top: 4px;
      }
      .actions .btn {
        flex: 1;
        font-size: 1.15rem;
        padding: 14px;
      }
      .btn:disabled {
        opacity: 0.5;
        box-shadow: none;
        transform: none;
        cursor: default;
      }
    `,
  ],
})
export class ProfileEditor implements OnInit {
  private readonly profiles = inject(ProfileService);

  /** Profil à modifier (null = création). */
  readonly profile = input<Profile | null>(null);
  readonly save = output<ProfileDraft>();
  readonly cancel = output<void>();

  readonly avatars = AVATARS;
  readonly nameMax = this.profiles.nameMax;

  readonly name = signal('');
  readonly img = signal(AVATARS[0].img);
  readonly canRead = signal(true);

  readonly canSave = computed(() => this.name().trim().length > 0 && !!this.img());

  ngOnInit(): void {
    const p = this.profile();
    if (p) {
      this.name.set(p.name);
      this.img.set(p.img);
      this.canRead.set(p.canRead !== false);
    }
  }

  submit(): void {
    if (!this.canSave()) return;
    this.save.emit({ name: this.name().trim(), img: this.img(), canRead: this.canRead() });
  }
}
