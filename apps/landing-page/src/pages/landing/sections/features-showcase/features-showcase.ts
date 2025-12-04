import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Button } from '@org/buttons';
import { SHOWCASE_ITEMS } from './showcase.data';
import { ShowcaseItem } from './showcase.model';
 
@Component({
  selector: 'app-features-showcase',
  imports: [Button, MatSlideToggleModule, MatIconModule],
  templateUrl: './features-showcase.html',
  styleUrl: './features-showcase.scss',
})

export class FeaturesShowcase {
  showcaseItems: ShowcaseItem[] = SHOWCASE_ITEMS;
  
}
