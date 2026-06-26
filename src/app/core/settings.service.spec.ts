import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let settings: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    settings = TestBed.inject(SettingsService);
  });

  it('par défaut, tout thème est affiché (liste noire vide)', () => {
    expect(settings.isThemeEnabled('vico', 'numbers')).toBe(true);
    expect(settings.isThemeEnabled('vico', 'instruments')).toBe(true);
    expect(settings.isThemeEnabled('vico', 'theme-ajoute-plus-tard')).toBe(true);
  });

  it('masquer puis ré-afficher un thème', () => {
    settings.setThemeEnabled('vico', 'numbers', false);
    expect(settings.isThemeEnabled('vico', 'numbers')).toBe(false);
    settings.setThemeEnabled('vico', 'numbers', true);
    expect(settings.isThemeEnabled('vico', 'numbers')).toBe(true);
  });

  it('les deux modes sont actifs par défaut, et on ne peut pas tout désactiver', () => {
    expect(settings.isModeEnabled('vico', 'read')).toBe(true);
    expect(settings.isModeEnabled('vico', 'listen')).toBe(true);
    settings.setModeEnabled('vico', 'read', false);
    settings.setModeEnabled('vico', 'listen', false); // refusé : au moins un mode
    expect(settings.isModeEnabled('vico', 'listen')).toBe(true);
  });

  it('vitesse par défaut = 90 % et bornée à [50, 100]', () => {
    expect(settings.rateFor('vico')).toBe(90);
    settings.setRate('vico', 10);
    expect(settings.rateFor('vico')).toBe(50);
    settings.setRate('vico', 999);
    expect(settings.rateFor('vico')).toBe(100);
  });

  it('migration de l’ancien format (liste blanche) → tout redevient visible', () => {
    localStorage.setItem('ek.settings.vico', JSON.stringify({ themes: ['numbers'], modes: ['read'] }));
    // Nouvelle instance pour forcer le rechargement depuis le localStorage.
    const fresh = TestBed.inject(SettingsService);
    expect(fresh.isThemeEnabled('vico', 'colors')).toBe(true);
    expect(fresh.isThemeEnabled('vico', 'numbers')).toBe(true);
  });

  it('PIN par défaut 1234, modifiable', () => {
    expect(settings.checkPin('1234')).toBe(true);
    settings.setPin('4821');
    expect(settings.checkPin('4821')).toBe(true);
    expect(settings.checkPin('1234')).toBe(false);
  });
});
