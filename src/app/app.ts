import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProfileHeader } from './shared/profile-header/profile-header';
import { AudioWarning } from './shared/audio-warning/audio-warning';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProfileHeader, AudioWarning],
  template: `<app-profile-header /><router-outlet /><app-audio-warning />`,
})
export class App {}
