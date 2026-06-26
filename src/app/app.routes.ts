import { Routes } from '@angular/router';
import { profileGuard } from './core/profile.guard';

export const routes: Routes = [
  {
    path: 'profiles',
    loadComponent: () => import('./pages/profiles/profiles').then((m) => m.Profiles),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
  },
  {
    path: '',
    canActivate: [profileGuard],
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'numbers',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./pages/numbers-learn/numbers-learn').then((m) => m.NumbersLearn),
  },
  {
    path: 'colors',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./pages/colors-learn/colors-learn').then((m) => m.ColorsLearn),
  },
  {
    path: 'g/:id',
    canActivate: [profileGuard],
    loadComponent: () => import('./pages/group/group').then((m) => m.Group),
  },
  {
    path: 'm/:id',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./pages/emoji-learn/emoji-learn').then((m) => m.EmojiLearn),
  },
  {
    path: 'quiz/:id/:mode',
    canActivate: [profileGuard],
    loadComponent: () => import('./pages/quiz/quiz').then((m) => m.Quiz),
  },
  {
    path: 'test/:id/:mode',
    canActivate: [profileGuard],
    loadComponent: () => import('./pages/grand-test/grand-test').then((m) => m.GrandTest),
  },
  { path: '**', redirectTo: '' },
];
