import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <main class="screen home">
      <div class="spacer"></div>
      <h1 class="title big">English Kids</h1>
      <p class="subtitle">Apprends l'anglais en jouant&nbsp;!</p>
      <div class="spacer"></div>

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
      <div class="spacer"></div>
    </main>
  `,
  styles: [
    `
      .big {
        font-size: clamp(2.2rem, 11vw, 3.4rem);
      }
      .tile {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        text-decoration: none;
        color: #fff;
        border-radius: var(--radius);
        padding: 26px 16px;
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
        font-size: 4rem;
      }
      .label {
        font-size: 2rem;
        font-weight: 700;
      }
      .hint {
        font-size: 1.1rem;
        opacity: 0.95;
      }
    `,
  ],
})
export class Home {}
