import { Component } from '@angular/core';
import { FeaturesShowcase } from '../features-showcase/features-showcase';
import { Button } from '@org/buttons';

@Component({
  selector: 'app-hero',
  imports: [FeaturesShowcase, Button],
  templateUrl: './hero.html',
  styleUrl: './hero.scss'
})
export class Hero {

}
