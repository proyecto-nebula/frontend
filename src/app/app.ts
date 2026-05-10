import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStatusUi } from '@ui/auth-status.ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AuthStatusUi],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');
}
