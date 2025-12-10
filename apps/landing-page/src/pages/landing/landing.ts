import { Component } from '@angular/core';
import { Hero } from "./sections/hero/hero";
import { AboutSection } from './sections/about-section/about-section';
import { Pricing } from "./sections/pricing/pricing";

@Component({
  selector: 'app-landing',
  imports: [Hero, AboutSection, Pricing],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing {

}
