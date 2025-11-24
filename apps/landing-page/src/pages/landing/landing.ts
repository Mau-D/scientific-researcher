import { Component } from '@angular/core';
import { Hero } from "./sections/hero/hero";
import { FeaturesShowcase } from "./sections/features-showcase/features-showcase";

@Component({
  selector: 'app-landing',
  imports: [Hero, FeaturesShowcase],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {

}
