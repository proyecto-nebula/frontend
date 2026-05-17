import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderUi } from '@web/ui/header/header.ui';

@Component({
  selector: 'app-settings-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderUi],
  templateUrl: './settings.layout.html',
})
export class SettingsLayout implements OnDestroy {
  constructor() {
    document.body.classList.add('settings');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('settings');
  }
}
