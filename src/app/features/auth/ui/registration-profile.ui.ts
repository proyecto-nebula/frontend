import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Avatar } from '@models/avatar.model';

@Component({
  selector: 'auth-registration-profile-ui',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration-profile.ui.html',
  styleUrls: ['./registration-profile.ui.scss'],
})
export class RegistrationProfileUi implements OnChanges {
  @Input('formGroup') group!: FormGroup;
  @Input() avatars: Avatar[] = [];
  @Output() avatarSelected = new EventEmitter<Avatar | null>();

  selectAvatar(id: number) {
    console.debug('[RegistrationProfileUi] selectAvatar', id);
    const avatar = this.avatars.find((a) => a.id === id) ?? null;
    this.group.patchValue({ avatarId: avatar?.id ?? null });
    this.avatarSelected.emit(avatar);
  }

  get selectedAvatar(): Avatar | undefined {
    const id = this.group.get('avatarId')?.value;
    return this.avatars.find((a) => a.id === id);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['avatars']) {
      console.debug('[RegistrationProfileUi] avatars changed', this.avatars?.length, this.avatars);
    }
  }
}
