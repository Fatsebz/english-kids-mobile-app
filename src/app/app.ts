import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProfileHeader } from './shared/profile-header/profile-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProfileHeader],
  template: `<app-profile-header /><router-outlet />`,
})
export class App {}
