import { DOCUMENT } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './admin.layout.html',
})
export class AdminLayout implements OnInit, OnDestroy {
  private readonly doc = inject(DOCUMENT);

  ngOnInit(): void {
    this.doc.body.classList.add('admin');
  }

  ngOnDestroy(): void {
    this.doc.body.classList.remove('admin');
  }
}
