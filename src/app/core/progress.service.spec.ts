import { TestBed } from '@angular/core/testing';
import { ProgressService } from './progress.service';
import { ProfileService } from './profile.service';

describe('ProgressService', () => {
  let progress: ProgressService;
  let profiles: ProfileService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    profiles = TestBed.inject(ProfileService);
    progress = TestBed.inject(ProgressService);
    profiles.createWithId('vico', 'Victor', 'profiles/vico.webp');
    profiles.createWithId('bille', 'Bertille', 'profiles/bille.webp');
    profiles.select('vico');
  });

  it('démarre à 0 étoile', () => {
    expect(progress.stars('numbers', 20)).toBe(0);
  });

  it('1 bonne réponse → 1 étoile', () => {
    progress.recordCorrect('numbers', '1');
    expect(progress.stars('numbers', 20)).toBe(1);
  });

  it('la moitié des éléments → 2 étoiles', () => {
    for (let i = 1; i <= 10; i++) progress.recordCorrect('numbers', String(i));
    expect(progress.stars('numbers', 20)).toBe(2);
  });

  it('tous les éléments → 3 étoiles', () => {
    for (let i = 1; i <= 20; i++) progress.recordCorrect('numbers', String(i));
    expect(progress.stars('numbers', 20)).toBe(3);
  });

  it('ne compte pas deux fois le même élément', () => {
    progress.recordCorrect('numbers', '1');
    progress.recordCorrect('numbers', '1');
    expect(progress.masteredCount('numbers')).toBe(1);
  });

  it('champion : faux puis vrai après setChampion', () => {
    expect(progress.isChampion('numbers')).toBe(false);
    progress.setChampion('numbers');
    expect(progress.isChampion('numbers')).toBe(true);
  });

  it('resetTheme remet le thème à zéro', () => {
    progress.recordCorrect('numbers', '1');
    progress.resetTheme('vico', 'numbers');
    expect(progress.stars('numbers', 20)).toBe(0);
  });

  it('la progression est isolée par profil', () => {
    progress.recordCorrect('numbers', '1');
    profiles.select('bille');
    TestBed.tick(); // laisse l'effect recharger la progression du nouveau profil
    expect(progress.stars('numbers', 20)).toBe(0);
  });
});
