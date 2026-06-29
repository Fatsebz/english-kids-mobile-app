import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AVATARS, Profile, ProfileService } from '../../core/profile.service';
import { ProgressService } from '../../core/progress.service';
import { SettingsService, QuizMode } from '../../core/settings.service';
import { AudioService } from '../../core/audio.service';
import { THEMES } from '../../data/themes';
import { APP_VERSION, CHANGELOG } from '../../data/changelog';
import { ProfileEditor, ProfileDraft } from '../../shared/profile-editor/profile-editor';

/** Cible de restauration d'un id de profil : « créer » ou un id de profil existant. */
const CREATE_TARGET = '__create__';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, ProfileEditor],
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
          <p class="version">version {{ appVersion }}</p>
          <div class="pad">
            @for (d of pad; track d) {
              <button class="key" (click)="press(d)">{{ d }}</button>
            }
            <button class="key" (click)="back()">⌫</button>
          </div>
        </div>
      } @else {
        @if (children().length) {
          <h2 class="group-head child-head">
            <span>👤 Réglages pour</span>
            @if (children().length > 1) {
              <button class="child-switch" (click)="cycleChild()" aria-label="Changer de profil">
                {{ childName() }} <span class="switch-ico" aria-hidden="true">🔁</span>
              </button>
            } @else {
              <span class="child-name">{{ childName() }}</span>
            }
          </h2>

          <section class="card block acc">
            <button class="acc-head" (click)="toggle('themes')">
              <span>Thèmes affichés</span><span class="acc-icon">{{ open() === 'themes' ? '−' : '+' }}</span>
            </button>
            @if (open() === 'themes') {
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
          }
        </section>

        <section class="card block acc">
          <button class="acc-head" (click)="toggle('modes')">
            <span>Modes de quiz</span><span class="acc-icon">{{ open() === 'modes' ? '−' : '+' }}</span>
          </button>
          @if (open() === 'modes') {
            <label class="row">
              <span>📖 Lis le mot</span>
              <input type="checkbox" [checked]="settings.isModeEnabled(child(), 'read')" (change)="toggleMode('read', $event)" />
            </label>
            <label class="row">
              <span>👂 Écoute et trouve</span>
              <input type="checkbox" [checked]="settings.isModeEnabled(child(), 'listen')" (change)="toggleMode('listen', $event)" />
            </label>
          }
        </section>

        <section class="card block acc">
          <button class="acc-head" (click)="toggle('voice')">
            <span>🔊 Voix</span><span class="acc-icon">{{ open() === 'voice' ? '−' : '+' }}</span>
          </button>
          @if (open() === 'voice') {
            <p class="sub-label">Vitesse</p>
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

            @if (voices().length) {
              <p class="sub-label">Choix de la voix (homme / femme, 🇬🇧 ou 🇺🇸)</p>
              <div class="voice-field">
                <button class="voice-sel" (click)="voiceOpen.set(!voiceOpen())" aria-haspopup="listbox">
                  <span class="voice-cur">{{ currentVoiceLabel() }}</span>
                  <span class="caret" aria-hidden="true">{{ voiceOpen() ? '▴' : '▾' }}</span>
                </button>
                @if (voiceOpen()) {
                  <div class="voice-list" role="listbox">
                    <button
                      class="voice-opt"
                      [class.sel]="settings.voiceFor(child()) === ''"
                      (click)="selectVoice('')"
                    >
                      Voix par défaut
                    </button>
                    @for (v of voices(); track v.uri) {
                      <button
                        class="voice-opt"
                        [class.sel]="settings.voiceFor(child()) === v.uri"
                        (click)="selectVoice(v.uri)"
                      >
                        {{ v.label }}
                      </button>
                    }
                  </div>
                }
              </div>
            } @else {
              <p class="hint-txt">
                Aucune autre voix disponible sur cet appareil. Tu peux installer des voix anglaises
                dans les réglages Android (Synthèse vocale).
              </p>
            }

            <button class="btn" (click)="testVoice()">🔊 Tester la voix</button>
          }
        </section>

        <section class="card block acc">
          <button class="acc-head" (click)="toggle('reset')">
            <span>Réinitialiser l'avancement</span><span class="acc-icon">{{ open() === 'reset' ? '−' : '+' }}</span>
          </button>
          @if (open() === 'reset') {
            @if (resettableThemes().length) {
              <button class="btn danger" (click)="resetAll()">Tout réinitialiser pour {{ childName() }}</button>
              <div class="rows">
                @for (t of resettableThemes(); track t.id) {
                  <div class="row">
                    <span>{{ t.tileEmoji }} {{ t.title }}</span>
                    <button class="mini" (click)="resetTheme(t.id)">Réinitialiser</button>
                  </div>
                }
              </div>
            } @else {
              <p class="hint-txt">Aucun avancement à réinitialiser pour {{ childName() }}.</p>
            }
          }
        </section>
        }

        <h2 class="group-head">🛠️ Réglages généraux</h2>

        <section class="card block acc">
          <button class="acc-head" (click)="toggle('profiles')">
            <span>👤 Profils</span><span class="acc-icon">{{ open() === 'profiles' ? '−' : '+' }}</span>
          </button>
          @if (open() === 'profiles') {
            <div class="rows">
              @for (p of children(); track p.id) {
                <div class="row prof-row">
                  <span class="prof"><img [src]="p.img" alt="" />{{ p.name }}</span>
                  <span class="prof-actions">
                    <button class="mini" (click)="editProfile(p)" aria-label="Renommer">✏️</button>
                    <button class="mini danger-mini" (click)="deleteProfile(p)" aria-label="Supprimer">🗑️</button>
                  </span>
                </div>
              }
              @if (!children().length) {
                <p class="hint-txt">Aucun profil. Ajoutes-en un ci-dessous.</p>
              }
            </div>
            <button class="btn btn--green" [disabled]="children().length >= maxProfiles" (click)="addProfile()">
              ➕ Ajouter un profil
            </button>
          }
        </section>

        <section class="card block acc">
          <button class="acc-head" (click)="toggle('pin')">
            <span>Code parent</span><span class="acc-icon">{{ open() === 'pin' ? '−' : '+' }}</span>
          </button>
          @if (open() === 'pin') {
            <label class="row">
              <span>🔒 Protéger les réglages par un code</span>
              <input type="checkbox" [checked]="pinProtected()" (change)="togglePinProtection($event)" />
            </label>
            @if (pinProtected()) {
              <p class="hint-txt">Modifier le code à 4 chiffres :</p>
              <div class="pin-change">
                <input #np type="tel" inputmode="numeric" maxlength="4" placeholder="Nouveau code" />
                <button class="icon-btn" (click)="changePin(np)" aria-label="Changer le code" title="Changer le code">✓</button>
              </div>
              @if (pinError()) { <p class="err">Le code doit comporter exactement 4 chiffres.</p> }
              @if (pinSaved()) { <p class="ok">Code mis à jour ✅</p> }
            } @else {
              <p class="hint-txt">⚠️ Les réglages sont accessibles sans code.</p>
            }
          }
        </section>

        <section class="card block acc">
          <button class="acc-head" (click)="toggle('backup')">
            <span>Sauvegarde</span><span class="acc-icon">{{ open() === 'backup' ? '−' : '+' }}</span>
          </button>
          @if (open() === 'backup') {
            <p class="hint-txt">
              Exporte la progression et les réglages de <b>tous les profils</b> (à garder en lieu sûr ou
              transférer sur un autre appareil). La progression est sinon perdue en cas de désinstallation.
            </p>
            <div class="save-actions">
              <button class="btn" (click)="exportData()">⬇️ Exporter</button>
              <button class="btn btn--ghost" (click)="importData()">⬆️ Restaurer</button>
            </div>
            <textarea
              #ta
              class="backup"
              [value]="backupText()"
              (input)="backupText.set(ta.value)"
              placeholder="Le code de sauvegarde apparaît ici après « Exporter ». Pour restaurer, colle un code ici puis « Restaurer » (l'application se rechargera)."
            ></textarea>
            @if (backupMsg()) { <p class="ok">{{ backupMsg() }}</p> }
            @if (backupError()) { <p class="err">{{ backupError() }}</p> }

            @if (restoreRows(); as rows) {
              <div class="restore">
                <p class="hint-txt">
                  Associe chaque profil de la sauvegarde à un profil de cette application (ou crée-le).
                  Utile après un changement d'application : les anciens identifiants peuvent différer.
                </p>
                <div class="rows">
                  @for (r of rows; track r.oldId) {
                    <div class="row">
                      <span>{{ r.label }}</span>
                      <select class="map-sel" (change)="setTarget(r.oldId, $event)">
                        <option [value]="createTarget" [selected]="restoreTargets()[r.oldId] === createTarget">
                          ＋ Créer ce profil
                        </option>
                        @for (p of children(); track p.id) {
                          <option [value]="p.id" [selected]="restoreTargets()[r.oldId] === p.id">→ {{ p.name }}</option>
                        }
                      </select>
                    </div>
                  }
                </div>
                <div class="save-actions">
                  <button class="btn btn--green" (click)="confirmRestore()">✅ Confirmer</button>
                  <button class="btn btn--ghost" (click)="cancelRestore()">Annuler</button>
                </div>
              </div>
            }
          }
        </section>

        <section class="card block acc">
          <button class="acc-head" (click)="toggle('items')">
            <span>📋 Liste des éléments</span><span class="acc-icon">{{ open() === 'items' ? '−' : '+' }}</span>
          </button>
          @if (open() === 'items') {
            @for (t of themes; track t.id) {
              <div class="theme-group">
                <h3 class="theme-title">{{ t.tileEmoji }} {{ t.title }} <span class="theme-fr">· {{ t.fr }}</span></h3>
                <div class="item-list">
                  @for (it of t.items; track it.key) {
                    <div class="item">
                      <span class="vis">
                        @if (it.kind === 'color') {
                          <span class="cdot" [class.bordered]="it.light" [style.background]="it.display"></span>
                        } @else if (it.img) {
                          <img [src]="it.img" alt="" />
                        } @else if (it.kind === 'word') {
                          📝
                        } @else {
                          {{ it.display }}
                        }
                      </span>
                      <span class="txt">
                        <span class="en">{{ it.label }}</span>
                        <span class="fr-tr">{{ it.fr }}</span>
                      </span>
                    </div>
                  }
                </div>
              </div>
            }
          }
        </section>

        <section class="card block acc">
          <button class="acc-head" (click)="toggle('about')">
            <span>À propos</span><span class="acc-icon">{{ open() === 'about' ? '−' : '+' }}</span>
          </button>
          @if (open() === 'about') {
            <p class="ver">Version {{ appVersion }}</p>
            @for (e of changelog; track e.version) {
              <div class="cl-entry">
                <div class="cl-head">{{ e.version }} <span class="cl-date">· {{ e.date }}</span></div>
                <ul class="cl-list">
                  @for (c of e.changes; track c) {
                    <li>{{ c }}</li>
                  }
                </ul>
              </div>
            }
          }
        </section>
      }
    </main>

    @if (editorOpen()) {
      <app-profile-editor [profile]="editing()" (save)="onEditorSave($event)" (cancel)="closeEditor()" />
    }
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
      .acc {
        padding: 0;
      }
      /* En-têtes de groupe (séparation profil / général) */
      .group-head {
        margin: 22px 4px 2px;
        font-size: 1.05rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        opacity: 0.85;
        color: var(--c-text);
        border-bottom: 3px solid rgba(0, 0, 0, 0.1);
        padding-bottom: 6px;
      }
      .group-head:first-of-type {
        margin-top: 4px;
      }
      /* Liste des éléments (#10) */
      .theme-group {
        border-top: 1px solid #eee;
        padding-top: 10px;
        margin-top: 10px;
      }
      .theme-group:first-child {
        border-top: none;
        margin-top: 0;
        padding-top: 0;
      }
      .theme-title {
        margin: 0 0 8px;
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--c-text);
      }
      .theme-fr {
        font-weight: 400;
        opacity: 0.6;
        font-size: 0.9rem;
      }
      .item-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px 14px;
      }
      .item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95rem;
        min-width: 0;
        padding: 3px 0;
      }
      .item .vis {
        flex: 0 0 26px;
        text-align: center;
        font-size: 1.2rem;
      }
      .item .vis img {
        width: 22px;
        height: 22px;
        object-fit: contain;
        vertical-align: middle;
      }
      .item .cdot {
        display: inline-block;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        vertical-align: middle;
      }
      .item .cdot.bordered {
        border: 1px solid #d9dce1;
      }
      .item .txt {
        display: flex;
        flex-direction: column;
        min-width: 0;
        line-height: 1.15;
      }
      .item .en {
        font-weight: 600;
        text-transform: capitalize;
        overflow-wrap: anywhere;
      }
      .item .fr-tr {
        font-size: 0.8rem;
        opacity: 0.55;
        text-transform: capitalize;
        overflow-wrap: anywhere;
      }
      .acc-head {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        background: none;
        border: none;
        padding: 9px 16px;
        cursor: pointer;
        font-family: inherit;
        font-size: 1.15rem;
        font-weight: 700;
        line-height: 1;
        color: var(--c-text);
        text-align: left;
      }
      .acc-icon {
        flex: 0 0 auto;
        font-size: 1.4rem;
        line-height: 1;
        width: 22px;
        text-align: center;
        color: var(--c-blue);
      }
      .acc > *:not(.acc-head) {
        margin-left: 16px;
        margin-right: 16px;
      }
      .acc > *:not(.acc-head):last-child {
        margin-bottom: 16px;
      }
      .child-head {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 10px;
      }
      .child-head .child-name {
        text-transform: none;
        color: var(--c-blue);
      }
      .child-switch {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: none;
        border-radius: 999px;
        font-family: inherit;
        font-weight: 700;
        font-size: 1rem;
        text-transform: none;
        padding: 8px 16px;
        background: #fff;
        color: var(--c-blue);
        box-shadow: 0 4px 0 rgba(0, 0, 0, 0.16);
        cursor: pointer;
      }
      .child-switch:active {
        transform: translateY(3px);
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.16);
      }
      .switch-ico {
        font-size: 0.95rem;
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
      .prof {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.05rem;
      }
      .prof img {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #fff;
        box-shadow: 0 2px 6px var(--c-shadow);
      }
      .prof-actions {
        display: flex;
        gap: 8px;
      }
      .prof-actions .mini {
        background: #eef2f7;
        color: var(--c-text);
        font-size: 1.1rem;
        padding: 6px 10px;
      }
      .prof-actions .danger-mini {
        background: #ffe3e3;
        color: #c92a2a;
      }
      .map-sel {
        font-family: inherit;
        font-size: 0.95rem;
        padding: 6px 8px;
        border: 2px solid #ddd;
        border-radius: 10px;
        max-width: 55%;
      }
      .restore {
        border-top: 1px solid #eee;
        margin-top: 12px;
        padding-top: 12px;
      }
      .danger {
        background: #c92a2a;
        box-shadow: 0 6px 0 #9c2020;
        display: block;
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
      .version {
        margin: 0;
        font-size: 0.85rem;
        opacity: 0.6;
      }
      .ver {
        font-weight: 700;
        margin: 0 0 10px;
      }
      .cl-entry {
        border-top: 1px solid #eee;
        padding-top: 8px;
        margin-top: 8px;
      }
      .cl-entry:first-of-type {
        border-top: none;
        margin-top: 0;
      }
      .cl-head {
        font-weight: 700;
      }
      .cl-date {
        font-weight: 400;
        opacity: 0.6;
        font-size: 0.9rem;
      }
      .cl-list {
        margin: 6px 0 0;
        padding-left: 18px;
        font-size: 0.95rem;
      }
      .cl-list li {
        margin: 3px 0;
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
      /* Liste de voix personnalisée (largeur 100 % du champ, jamais de débordement) */
      .voice-field {
        position: relative;
        margin-bottom: 12px;
      }
      .voice-sel {
        width: 100%;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-family: inherit;
        font-size: 1rem;
        padding: 12px;
        border: 2px solid #ddd;
        border-radius: 14px;
        background: #fff;
        color: var(--c-text);
        cursor: pointer;
        text-align: left;
      }
      .voice-cur {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .caret {
        flex: 0 0 auto;
        color: var(--c-blue);
      }
      .voice-list {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        width: 100%;
        box-sizing: border-box;
        max-height: 240px;
        overflow-y: auto;
        background: #fff;
        border: 2px solid #ddd;
        border-radius: 14px;
        box-shadow: 0 10px 24px var(--c-shadow);
        z-index: 20;
      }
      .voice-opt {
        display: block;
        width: 100%;
        box-sizing: border-box;
        text-align: left;
        font-family: inherit;
        font-size: 1rem;
        padding: 12px;
        border: none;
        border-bottom: 1px solid #eee;
        background: none;
        color: var(--c-text);
        cursor: pointer;
        overflow-wrap: anywhere;
      }
      .voice-opt:last-child {
        border-bottom: none;
      }
      .voice-opt.sel {
        background: #eaf3ff;
        font-weight: 700;
      }
      .sub-label {
        margin: 4px 0 8px;
        font-weight: 600;
        font-size: 0.95rem;
        opacity: 0.8;
      }
      .hint-txt {
        margin: 0 0 12px;
        font-size: 0.95rem;
        opacity: 0.75;
      }
      .save-actions {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
      }
      .save-actions .btn {
        flex: 1;
      }
      .backup {
        /* Tient compte des marges latérales de 16px héritées de .acc > * (sinon débordement). */
        width: calc(100% - 32px);
        min-height: 90px;
        font-family: monospace;
        font-size: 0.85rem;
        padding: 10px;
        border: 2px solid #ddd;
        border-radius: 14px;
        resize: vertical;
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
  readonly maxProfiles = this.profiles.maxProfiles;
  readonly voices = this.audio.voices;
  readonly themes = THEMES;
  readonly appVersion = APP_VERSION;
  readonly changelog = CHANGELOG;
  readonly pad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  readonly createTarget = CREATE_TARGET;

  // Si le parent a retiré la protection, l'écran s'ouvre directement (pas de pavé PIN).
  readonly unlocked = signal(!this.settings.pinEnabled());
  readonly pinProtected = signal(this.settings.pinEnabled());
  /** Section d'accordéon ouverte (une seule à la fois ; '' = toutes repliées). */
  readonly open = signal('');
  readonly entry = signal('');
  readonly error = signal(false);
  readonly child = signal(this.children()[0]?.id ?? '');
  readonly pinSaved = signal(false);
  readonly pinError = signal(false);
  /** Liste de voix personnalisée ouverte (remplace le `<select>` natif qui débordait sous Chrome). */
  readonly voiceOpen = signal(false);
  /** Incrémenté après une réinitialisation pour recalculer la liste des thèmes réinitialisables. */
  private readonly resetTick = signal(0);

  /** Thèmes ayant un avancement pour l'enfant courant (les seuls à proposer en réinitialisation). */
  readonly resettableThemes = computed(() => {
    this.resetTick();
    const ids = new Set(this.progress.themesWithProgress(this.child()));
    return this.themes.filter((t) => ids.has(t.id));
  });
  readonly backupText = signal('');
  readonly backupMsg = signal('');
  readonly backupError = signal('');

  // ---- Gestion des profils ----
  readonly editorOpen = signal(false);
  readonly editing = signal<Profile | null>(null);

  // ---- Restauration avec remappage d'id ----
  readonly restoreRows = signal<{ oldId: string; label: string }[] | null>(null);
  readonly restoreTargets = signal<Record<string, string>>({});
  private restorePayload: Record<string, unknown> = {};
  private restoreMeta: Record<string, { name: string; img: string }> = {};

  childName(): string {
    return this.children().find((c) => c.id === this.child())?.name ?? '';
  }

  /** Passe au profil suivant (le nom de profil sert de bouton quand il y a plusieurs profils). */
  cycleChild(): void {
    const list = this.children();
    if (list.length < 2) return;
    const i = list.findIndex((c) => c.id === this.child());
    this.child.set(list[(i + 1) % list.length].id);
  }

  // ---- Profils ----
  addProfile(): void {
    this.editing.set(null);
    this.editorOpen.set(true);
  }

  editProfile(p: Profile): void {
    this.editing.set(p);
    this.editorOpen.set(true);
  }

  closeEditor(): void {
    this.editorOpen.set(false);
    this.editing.set(null);
  }

  onEditorSave(draft: ProfileDraft): void {
    const target = this.editing();
    if (target) {
      this.profiles.renameProfile(target.id, draft.name, draft.img, draft.canRead);
    } else {
      const created = this.profiles.addProfile(draft.name, draft.img, draft.canRead);
      if (created) this.child.set(created.id);
    }
    this.closeEditor();
  }

  deleteProfile(p: Profile): void {
    if (!confirm(`Supprimer le profil « ${p.name} » et tout son avancement ?`)) return;
    this.profiles.removeProfile(p.id);
    this.progress.resetProfile(p.id);
    this.settings.clear(p.id);
    // Garder un onglet courant valide.
    if (!this.children().some((c) => c.id === this.child())) {
      this.child.set(this.children()[0]?.id ?? '');
    }
  }

  toggle(id: string): void {
    this.open.update((cur) => (cur === id ? '' : id));
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

  /** Libellé de la voix actuellement sélectionnée pour l'enfant courant. */
  currentVoiceLabel(): string {
    const uri = this.settings.voiceFor(this.child());
    if (!uri) return 'Voix par défaut';
    return this.voices().find((v) => v.uri === uri)?.label ?? 'Voix par défaut';
  }

  selectVoice(uri: string): void {
    this.settings.setVoice(this.child(), uri);
    this.voiceOpen.set(false);
  }

  testVoice(): void {
    this.audio.speak(
      'Hello! Cat, dog, sun.',
      this.settings.rateFor(this.child()) / 100,
      'en-US',
      this.settings.voiceFor(this.child()),
    );
  }

  resetAll(): void {
    if (confirm(`Effacer tout l'avancement de ${this.childName()} ?`)) {
      this.progress.resetProfile(this.child());
      this.resetTick.update((n) => n + 1);
    }
  }

  resetTheme(themeId: string): void {
    this.progress.resetTheme(this.child(), themeId);
    this.resetTick.update((n) => n + 1);
  }

  /** Exporte toutes les données `ek.*` (hors profil courant) en JSON. */
  exportData(): void {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('ek.') && k !== 'ek.profile') {
        const v = localStorage.getItem(k);
        if (v !== null) data[k] = v;
      }
    }
    const json = JSON.stringify({ app: 'english-kidz', version: 1, data });
    this.backupText.set(json);
    this.backupError.set('');
    this.backupMsg.set('Sauvegarde générée : copie ce texte et garde-le (un fichier .json a aussi été proposé au téléchargement).');
    try {
      navigator.clipboard?.writeText(json);
    } catch {
      /* presse-papier indisponible : le texte reste sélectionnable */
    }
    this.download(json);
  }

  private download(json: string): void {
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'english-kidz-sauvegarde.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* la WebView peut bloquer le téléchargement : le texte reste copiable */
    }
  }

  /**
   * Première étape de la restauration : valide le JSON et détecte les profils de la sauvegarde.
   * S'il y a des profils, propose un remappage (id → profil de cette app) ; sinon importe directement.
   */
  importData(): void {
    const raw = this.backupText().trim();
    this.backupMsg.set('');
    this.restoreRows.set(null);
    if (!raw) {
      this.backupError.set("Colle d'abord un code de sauvegarde dans la zone ci-dessous.");
      return;
    }
    let data: Record<string, unknown>;
    try {
      const parsed = JSON.parse(raw) as { app?: string; data?: Record<string, unknown> };
      if (parsed?.app !== 'english-kidz' || !parsed.data || typeof parsed.data !== 'object') {
        this.backupError.set('Code de sauvegarde invalide.');
        return;
      }
      data = parsed.data;
    } catch {
      this.backupError.set('Code de sauvegarde illisible.');
      return;
    }
    this.backupError.set('');

    // Ids de profil présents dans la sauvegarde (clés ek.progress.<id> / ek.settings.<id>).
    const ids = new Set<string>();
    for (const k of Object.keys(data)) {
      const m = k.match(/^ek\.(?:progress|settings)\.(.+)$/);
      if (m) ids.add(m[1]);
    }
    // Métadonnées (prénom/avatar) depuis ek.profiles de la sauvegarde, si présent.
    const meta: Record<string, { name: string; img: string }> = {};
    try {
      const bp = data['ek.profiles'];
      const list = typeof bp === 'string' ? JSON.parse(bp) : bp;
      if (Array.isArray(list)) {
        for (const p of list as Profile[]) {
          if (p?.id) {
            meta[p.id] = { name: p.name, img: p.img };
            ids.add(p.id);
          }
        }
      }
    } catch {
      /* ek.profiles illisible : on se rabat sur les valeurs par défaut */
    }

    this.restorePayload = data;
    this.restoreMeta = meta;

    if (ids.size === 0) {
      // Sauvegarde sans profil identifiable : import direct.
      this.applyImport(data, {});
      return;
    }

    const rows = [...ids].map((id) => ({ oldId: id, label: this.restoreLabel(id) }));
    const targets: Record<string, string> = {};
    for (const id of ids) targets[id] = this.profiles.hasProfileId(id) ? id : CREATE_TARGET;
    this.restoreRows.set(rows);
    this.restoreTargets.set(targets);
  }

  setTarget(oldId: string, ev: Event): void {
    const value = (ev.target as HTMLSelectElement).value;
    this.restoreTargets.update((t) => ({ ...t, [oldId]: value }));
  }

  cancelRestore(): void {
    this.restoreRows.set(null);
    this.restoreTargets.set({});
    this.restorePayload = {};
    this.restoreMeta = {};
  }

  /** Deuxième étape : crée les profils choisis, réécrit les clés selon le mapping, puis recharge. */
  confirmRestore(): void {
    const targets = this.restoreTargets();
    // Crée les profils marqués « Créer » en conservant leur id d'origine.
    for (const row of this.restoreRows() ?? []) {
      if (targets[row.oldId] === CREATE_TARGET) {
        const m = this.defaultMeta(row.oldId);
        this.profiles.createWithId(row.oldId, m.name, m.img);
      }
    }
    this.applyImport(this.restorePayload, targets);
  }

  /** Écrit les clés `ek.*` (en remappant les suffixes de profil) puis recharge l'application. */
  private applyImport(data: Record<string, unknown>, targets: Record<string, string>): void {
    for (const [k, v] of Object.entries(data)) {
      if (!k.startsWith('ek.')) continue;
      // La liste des profils est gérée via createWithId / les profils existants : on ne l'écrase pas.
      if (k === 'ek.profiles') continue;
      let key = k;
      const m = k.match(/^ek\.(progress|settings)\.(.+)$/);
      if (m) {
        const t = targets[m[2]];
        const newId = t && t !== CREATE_TARGET ? t : m[2];
        key = `ek.${m[1]}.${newId}`;
      }
      try {
        localStorage.setItem(key, String(v));
      } catch {
        /* quota : on continue au mieux */
      }
    }
    location.reload();
  }

  private restoreLabel(id: string): string {
    return `« ${this.defaultMeta(id).name} » (${id})`;
  }

  /** Prénom/avatar à utiliser pour un id de sauvegarde (sauvegarde > legacy vico/bille > id brut). */
  private defaultMeta(id: string): { name: string; img: string } {
    if (this.restoreMeta[id]) return this.restoreMeta[id];
    if (id === 'vico') return { name: 'Victor', img: 'profiles/vico.webp' };
    if (id === 'bille') return { name: 'Bertille', img: 'profiles/bille.webp' };
    return { name: id, img: AVATARS[0].img };
  }

  togglePinProtection(ev: Event): void {
    const on = (ev.target as HTMLInputElement).checked;
    this.settings.setPinEnabled(on);
    this.pinProtected.set(on);
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
