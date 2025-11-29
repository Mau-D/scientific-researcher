import { Component } from '@angular/core';
import { FeaturesShowcase } from '../features-showcase/features-showcase';

@Component({
  selector: 'app-hero',
  imports: [FeaturesShowcase],
  templateUrl: './hero.html',
  styleUrl: './hero.scss'
})
export class Hero {

}
