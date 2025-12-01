import { Component, inject } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import { MutedButton } from '@org/buttons';
import { ShowcaseItem } from './showcase.model';
import { SHOWCASE_ITEMS } from './showcase.data';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
 
@Component({
  selector: 'app-features-showcase',
  imports: [MutedButton, MatSlideToggleModule, MatIconModule],
  templateUrl: './features-showcase.html',
  styleUrl: './features-showcase.css',
})

export class FeaturesShowcase {
  showcaseItems: ShowcaseItem[] = SHOWCASE_ITEMS;
}
