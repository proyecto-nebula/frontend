import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedUiModule } from '../../../../shared/ui/ui.module';

@Component({
  selector: 'web-registration-success-ui',
  standalone: true,
  imports: [CommonModule, SharedUiModule],
  templateUrl: './registration-success.ui.html',
  styleUrls: ['./registration-success.ui.scss'],
})
export class WebRegistrationSuccessUi {
  @Input() username?: string | null;
  @Input() planName?: string | null;

  visible = true;

  constructor(private router: Router) {}

  onModalVisibleChange(v: boolean) {
    if (!v) {
      this.close();
    }
  }

  close() {
    // Navigate to home without query params
    this.router.navigate(['/']);
  }
}
