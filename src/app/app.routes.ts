import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'numbers',
    loadComponent: () =>
      import('./pages/numbers-learn/numbers-learn').then((m) => m.NumbersLearn),
  },
  {
    path: 'numbers/play',
    loadComponent: () =>
      import('./pages/numbers-game/numbers-game').then((m) => m.NumbersGame),
  },
  {
    path: 'colors',
    loadComponent: () =>
      import('./pages/colors-learn/colors-learn').then((m) => m.ColorsLearn),
  },
  {
    path: 'colors/play',
    loadComponent: () =>
      import('./pages/colors-game/colors-game').then((m) => m.ColorsGame),
  },
  { path: '**', redirectTo: '' },
];
