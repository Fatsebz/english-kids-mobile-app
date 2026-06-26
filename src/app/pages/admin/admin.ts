import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../core/profile.service';
import { ProgressService } from '../../core/progress.service';
import { SettingsService, QuizMode } from '../../core/settings.service';
import { AudioService } from '../../core/audio.service';
import { THEMES } from '../../data/themes';

@Component({
  selector: 'app-admin',
  imports: [RouterLink],
  template: `
    <main class="screen">
      <div class="topbar">
        <a class="btn-round" routerLink="/profiles" aria-label="Retour">⬅️</a>
        <h1 class="title">⚙️ Réglages</h1>
        <span class="btn-round" aria-hidden="true">🛠️</span>
      </div>

      @if (!unlocked()) {
        <div class="card pin-card">
          <p class="pin-label">Code parent</p>
          <div class="pin-dots">
            @for (i of [0, 1, 2, 3]; track i) {
              <span class="dot" [class.filled]="entry().length > i"></span>
            }
          </div>
          @if (error()) { <p class="err">Code incorrect</p> }
          <div class="pad">
            @for (d of pad; track d) {
              <button class="key" (click)="press(d)">{{ d }}</button>
            }
            <button class="key" (click)="back()">⌫</button>
          </div>
        </div>
      } @else {
        <div class="tabs">
          @for (c of children; track c.id) {
            <button class="tab" [class.active]="child() === c.id" (click)="child.set(c.id)">
              {{ c.name }}
            </button>
          }
        </div>

        <section class="card block">
          <h2>Thèmes affichés</h2>
          <div class="rows">
            @for (t of themes; track t.id) {
              <label class="row">
                <span>{{ t.tileEmoji }} {{ t.title }}</span>
                <input
                  type="checkbox"
                  [checked]="settings.isThemeEnabled(child(), t.id)"
                  (change)="toggleTheme(t.id, $event)"
                />
              </label>
            }
          </div>
        </section>

        <section class="card block">
          <h2>Modes de quiz</h2>
          <label class="row">
            <span>📖 Lis le mot</span>
            <input type="checkbox" [checked]="settings.isModeEnabled(child(), 'read')" (change)="toggleMode('read', $event)" />
          </label>
          <label class="row">
            <span>👂 Écoute et trouve</span>
            <input type="checkbox" [checked]="settings.isModeEnabled(child(), 'listen')" (change)="toggleMode('listen', $event)" />
          </label>
        </section>

        <section class="card block">
          <h2>Vitesse de la voix</h2>
          <div class="rate-row">
            <input
              type="range"
              min="50"
              max="100"
              step="10"
              [value]="settings.rateFor(child())"
              (input)="setRate($event)"
            />
            <span class="rate-val">{{ settings.rateFor(child()) }}%</span>
          </div>
          <button class="btn" (click)="testVoice()">🔊 Tester la voix</button>
        </section>

        <section class="card block">
          <h2>Réinitialiser l'avancement</h2>
          <button class="btn danger" (click)="resetAll()">Tout réinitialiser pour {{ childName() }}</button>
          <div class="rows">
            @for (t of themes; track t.id) {
              <div class="row">
                <span>{{ t.tileEmoji }} {{ t.title }}</span>
                <button class="mini" (click)="resetTheme(t.id)">Réinitialiser</button>
              </div>
            }
          </div>
        </section>

        <section class="card block">
          <h2>Code parent</h2>
          <div class="pin-change">
            <input #np type="tel" inputmode="numeric" maxlength="4" placeholder="Nouveau code" />
            <button class="icon-btn" (click)="changePin(np)" aria-label="Changer le code" title="Changer le code">✓</button>
          </div>
          @if (pinError()) { <p class="err">Le code doit comporter exactement 4 chiffres.</p> }
          @if (pinSaved()) { <p class="ok">Code mis à jour ✅</p> }
        </section>
      }
    </main>
  `,
  styles: [
    `
      h2 {
        margin: 0 0 10px;
        font-size: 1.2rem;
        color: var(--c-text);
      }
      .block {
        padding: 16px;
        color: var(--c-text);
      }
      .tabs {
        display: flex;
        gap: 10px;
      }
      .tab {
        flex: 1;
        border: none;
        border-radius: var(--radius);
        font-family: inherit;
        font-weight: 700;
        font-size: 1.1rem;
        padding: 12px;
        background: rgba(255, 255, 255, 0.6);
        color: var(--c-text);
        cursor: pointer;
      }
      .tab.active {
        background: #fff;
        box-shadow: 0 4px 0 rgba(0, 0, 0, 0.16);
      }
      .rows {
        display: flex;
        flex-direction: column;
      }
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 2px;
        border-top: 1px solid #eee;
        font-size: 1.05rem;
      }
      .row:first-child {
        border-top: none;
      }
      .row input[type='checkbox'] {
        width: 26px;
        height: 26px;
      }
      .mini {
        border: none;
        background: #ffe3e3;
        color: #c92a2a;
        border-radius: 12px;
        padding: 6px 12px;
        font-family: inherit;
        font-weight: 600;
        cursor: pointer;
      }
      .danger {
        background: #c92a2a;
        box-shadow: 0 6px 0 #9c2020;
        width: 100%;
        margin-bottom: 10px;
      }
      .danger:active {
        box-shadow: 0 2px 0 #9c2020;
      }
      .pin-change {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .pin-change input {
        flex: 1;
        min-width: 0;
        font-family: inherit;
        font-size: 1.1rem;
        padding: 12px;
        border: 2px solid #ddd;
        border-radius: 14px;
      }
      .icon-btn {
        flex: 0 0 auto;
        width: 54px;
        height: 54px;
        border: none;
        border-radius: 16px;
        background: var(--c-green);
        color: #fff;
        font-size: 1.8rem;
        font-weight: 700;
        line-height: 1;
        box-shadow: 0 5px 0 var(--c-green-d);
        cursor: pointer;
        display: grid;
        place-items: center;
      }
      .icon-btn:active {
        transform: translateY(3px);
        box-shadow: 0 2px 0 var(--c-green-d);
      }
      .ok {
        color: var(--c-green);
        margin: 8px 0 0;
      }
      .rate-row {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 12px;
      }
      .rate-row input[type='range'] {
        flex: 1;
        height: 32px;
      }
      .rate-val {
        font-weight: 700;
        font-size: 1.1rem;
        min-width: 52px;
        text-align: right;
      }
      /* Pavé PIN */
      .pin-card {
        padding: 22px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        color: var(--c-text);
      }
      .pin-label {
        margin: 0;
        font-weight: 600;
      }
      .pin-dots {
        display: flex;
        gap: 14px;
      }
      .dot {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid var(--c-text);
      }
      .dot.filled {
        background: var(--c-text);
      }
      .err {
        color: #c92a2a;
        margin: 0;
      }
      .pad {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        width: min(320px, 80vw);
      }
      .key {
        border: none;
        border-radius: 16px;
        background: #fff;
        box-shadow: 0 4px 0 rgba(0, 0, 0, 0.16);
        font-family: inherit;
        font-size: 1.6rem;
        font-weight: 700;
        padding: 16px 0;
        cursor: pointer;
        color: var(--c-text);
      }
      .key:active {
        transform: translateY(3px);
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.16);
      }
    `,
  ],
})
export class Admin {
  protected readonly settings = inject(SettingsService);
  private readonly progress = inject(ProgressService);
  private readonly profiles = inject(ProfileService);
  private readonly audio = inject(AudioService);

  readonly children = this.profiles.profiles;
  readonly themes = THEMES;
  readonly pad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  readonly unlocked = signal(false);
  readonly entry = signal('');
  readonly error = signal(false);
  readonly child = signal(this.children[0].id);
  readonly pinSaved = signal(false);
  readonly pinError = signal(false);

  childName(): string {
    return this.children.find((c) => c.id === this.child())?.name ?? '';
  }

  press(d: string): void {
    if (this.entry().length >= 4) return;
    this.error.set(false);
    const next = this.entry() + d;
    this.entry.set(next);
    if (next.length === 4) {
      if (this.settings.checkPin(next)) {
        this.unlocked.set(true);
      } else {
        this.error.set(true);
        this.entry.set('');
      }
    }
  }

  back(): void {
    this.entry.set(this.entry().slice(0, -1));
  }

  toggleTheme(themeId: string, ev: Event): void {
    this.settings.setThemeEnabled(this.child(), themeId, (ev.target as HTMLInputElement).checked);
  }

  toggleMode(mode: QuizMode, ev: Event): void {
    this.settings.setModeEnabled(this.child(), mode, (ev.target as HTMLInputElement).checked);
  }

  setRate(ev: Event): void {
    this.settings.setRate(this.child(), Number((ev.target as HTMLInputElement).value));
  }

  testVoice(): void {
    this.audio.speak('Hello! Cat, dog, sun.', this.settings.rateFor(this.child()) / 100);
  }

  resetAll(): void {
    if (confirm(`Effacer tout l'avancement de ${this.childName()} ?`)) {
      this.progress.resetProfile(this.child());
    }
  }

  resetTheme(themeId: string): void {
    this.progress.resetTheme(this.child(), themeId);
  }

  changePin(input: HTMLInputElement): void {
    const value = input.value.trim();
    if (!/^\d{4}$/.test(value)) {
      this.pinError.set(true);
      this.pinSaved.set(false);
      return;
    }
    this.settings.setPin(value);
    input.value = '';
    this.pinError.set(false);
    this.pinSaved.set(true);
    setTimeout(() => this.pinSaved.set(false), 2000);
  }
}
