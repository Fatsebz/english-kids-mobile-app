import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MODULES } from '../../data/modules';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <main class="screen home">
      <h1 class="title big">English Kids</h1>
      <p class="subtitle">Apprends l'anglais en jouant&nbsp;!</p>

      <div class="tiles">
        <a class="tile tile--numbers anim-pop" routerLink="/numbers">
          <span class="emoji">🔢</span>
          <span class="label">Numbers</span>
          <span class="hint">Les nombres</span>
        </a>

        <a class="tile tile--colors anim-pop" routerLink="/colors">
          <span class="emoji">🎨</span>
          <span class="label">Colors</span>
          <span class="hint">Les couleurs</span>
        </a>

        @for (m of modules; track m.id) {
          <a class="tile anim-pop" [routerLink]="['/m', m.id]" [style.background]="m.gradient">
            <span class="emoji">{{ m.tileEmoji }}</span>
            <span class="label">{{ m.title }}</span>
            <span class="hint">{{ m.fr }}</span>
          </a>
        }
      </div>
    </main>
  `,
  styles: [
    `
      .home {
        overflow-y: auto;
      }
      .big {
        font-size: clamp(2.2rem, 11vw, 3.4rem);
        text-align: center;
      }
      .subtitle {
        text-align: center;
      }
      .tiles {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        margin-top: 14px;
      }
      .tile {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        text-decoration: none;
        color: #fff;
        border-radius: var(--radius);
        padding: 22px 12px;
        box-shadow: 0 8px 0 rgba(0, 0, 0, 0.18);
        transition: transform 0.1s ease, box-shadow 0.1s ease;
      }
      .tile:active {
        transform: translateY(5px);
        box-shadow: 0 3px 0 rgba(0, 0, 0, 0.18);
      }
      .tile--numbers {
        background: linear-gradient(150deg, #ff6b6b, #ff8e53);
      }
      .tile--colors {
        background: linear-gradient(150deg, #4dabf7, #2ec27e);
      }
      .emoji {
        font-size: 3.2rem;
      }
      .label {
        font-size: 1.5rem;
        font-weight: 700;
      }
      .hint {
        font-size: 0.95rem;
        opacity: 0.95;
      }
    `,
  ],
})
export class Home {
  readonly modules = MODULES;
}
