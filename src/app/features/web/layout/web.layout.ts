import { DOCUMENT } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderUi } from '@ui/header/header.ui';
import { FooterUi } from '@ui/footer/footer.ui';

@Component({
  selector: 'app-web-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderUi, FooterUi],
  templateUrl: './web.layout.html',
})
export class WebLayout implements OnInit, OnDestroy {
  private readonly doc = inject(DOCUMENT);

  ngOnInit(): void {
    this.doc.body.classList.add('web');
  }

  ngOnDestroy(): void {
    this.doc.body.classList.remove('web');
  }
}
